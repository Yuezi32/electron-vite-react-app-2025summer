import { useState, useEffect } from 'react'
import { Button, Image, Table, Tag, Tooltip, Slider, notification } from 'antd'
import { ImportOutlined, ExportOutlined, FrownOutlined, SmileOutlined } from '@ant-design/icons'
import './home.styl'

export default function Home() {
    // 输入目录路径
    const [inputPath, setInputPath] = useState('')
    // 输出目录路径
    const [outputPath, setOutputPath] = useState('')
    // 压缩质量（整数：1-10）
    const [quality, setQuality] = useState(7)
    // loading状态
    const [loading, setLoading] = useState(false)
    // 图片列表数据源
    const [dataSource, setDataSource] = useState([])
    // 是否显示Antd的notification通知
    const [notificationInfo, setNotificationInfo] = useState(null)

    // 获取文件路径中的文件名
    function getFileName(filePath) {
        return filePath.split(/[/\\]/).pop()
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        // 如果大于等于1MB，则使用MB单位，四舍五入最多保留2位小数
        if (bytes >= 1024 * 1024) {
            return {
                size: parseFloat((bytes / (1024 * 1024)).toFixed(2)),
                unit: 'MB'
            }
        }
        // 如果小于1MB且大于等于1KB，则使用KB单位，四舍五入最多保留2位小数
        else if (bytes >= 1024) {
            return {
                size: parseFloat((bytes / 1024).toFixed(2)),
                unit: 'KB'
            }
        }
        // 如果小于1KB，则使用B单位，四舍五入保留整数
        else {
            return {
                size: Math.round(bytes),
                unit: 'B'
            }
        }
    }

    // Table表格列配置
    const columns = [
        {
            title: '图片预览',
            key: 'preview',
            width: 150,
            render: (record) => {
                return <Image width={80} src={'file://' + record.filePath} />
            }
        },
        {
            title: '文件名',
            key: 'filename',
            render: (record) => {
                return <Tooltip title={record.filePath}>{getFileName(record.filePath)}</Tooltip>
            }
        },
        {
            title: '图片尺寸',
            width: 150,
            key: 'imageSize',
            render: (record) => {
                const { width, height } = record.imageSize
                return `${width} x ${height}`
            }
        },
        {
            title: '原始文件大小',
            width: 150,
            align: 'right',
            key: 'filesize',
            render: (record) => {
                const formattedSize = formatFileSize(record.fileSize)
                return `${formattedSize.size} ${formattedSize.unit}`
            }
        },
        {
            title: '压缩后大小',
            key: 'compressFileSize',
            width: 150,
            align: 'right',
            render: (record) => {
                if (record.status !== 2) {
                    return ''
                }
                const formattedSize = formatFileSize(record.compressFileSize)
                return `${formattedSize.size} ${formattedSize.unit}`
            }
        },
        {
            title: '压缩比例',
            width: 120,
            key: 'compressPercent',
            render: (record) => {
                // “未开始”状态的显示效果
                if (record.status === 0) {
                    return <Tag>未开始</Tag>
                }
                // “压缩中”状态的显示效果
                else if (record.status === 1) {
                    return <Tag color="cyan">压缩中</Tag>
                }
                // “压缩完成”状态的显示效果（显示为压缩比例）
                else if (record.status === 2) {
                    const originalSize = record.fileSize
                    const compressedSize = record.compressFileSize
                    const percent = parseFloat(
                        (((compressedSize - originalSize) / originalSize) * 100).toFixed(2)
                    )
                    return <Tag color="green">{percent}%</Tag>
                }
                // “压缩失败”状态的显示效果
                else if (record.status === 3) {
                    return <Tag color="red">压缩失败</Tag>
                }
            }
        }
    ]

    // 点击设置输入目录按钮
    const handleSetInputPath = () => {
        // 通过preload接收主进程返回的目录图片文件列表
        window.api.readDirImages({
            callback: (event, info) => {
                console.log('渲染进程：接收主进程返回的目录图片文件列表：', info)
                // 如果用户取消了选择目录，则不进行任何操作
                if (info.canceled) return
                // 设置输入目录
                setInputPath(info.filePaths[0] || '')
                // 设置扫描出来的图片列表
                setDataSource(
                    info.fileList.map((fileInfo, index) => ({
                        key: index,
                        // 文件路径
                        filePath: fileInfo.filePath,
                        // 文件大小（字节数）
                        fileSize: fileInfo.fileSize,
                        // 图片尺寸
                        imageSize: fileInfo.imageSize,
                        // 压缩后文件大小（初始为null）
                        compressFileSize: null,
                        // 压缩比例（初始为null）
                        compressPercent: null,
                        // 状态（0=未开始, 1=压缩中, 2=压缩完成，3=压缩失败）
                        status: 0
                    }))
                )
            },
            data: {
                msg: '演示渲染进程向主进程传递数据'
            }
        })
    }

    // 点击设置输出目录按钮
    const handleSetOutputPath = () => {
        // 通过preload接收主进程返回的目录路径
        window.api.chooseDir({
            callback: (event, info) => {
                // 如果用户取消了选择目录，则不进行任何操作
                if (info.canceled) return
                // 设置输出目录
                setOutputPath(info.filePaths[0] || '')
            }
        })
    }

    // Antd的notification组件hook
    const [notificationApi, contextHolder] = notification.useNotification()

    // 压缩完成时显示Antd的notification
    useEffect(() => {
        if (notificationInfo) {
            notificationApi[notificationInfo.type]({
                message: notificationInfo.message,
                description: notificationInfo.description
            })
            // 清空Antd的notification状态
            setNotificationInfo(null)
        }
    }, [notificationInfo, notificationApi])

    // 开始压缩
    const handleStartCompress = async () => {
        // 如果正在压缩或者没有图片列表，则不执行
        if (loading === true || dataSource.length === 0) return
        // 如果没有设置输出目录，则不执行
        if (!outputPath || outputPath === '') {
            alert('请设置输出目录')
            return
        }
        // 置为loading态
        setLoading(true)
        // 备份dataSource
        const updatedDataSource = [...dataSource]

        // 逐个处理dataSource中的图片
        for (let index = 0; index < updatedDataSource.length; index++) {
            const item = updatedDataSource[index]
            // 设置状态为“压缩中”
            updatedDataSource[index].status = 1
            // 更新该条数据的状态
            setDataSource([...updatedDataSource])
            // 交给主进程进行图片处理
            const result = await window.api.imageCompress({
                inputPath: item.filePath,
                outputDir: outputPath,
                quality: quality * 10
            })

            if (result.success) {
                // 压缩成功，更新状态和压缩后文件大小
                updatedDataSource[index].status = 2
                updatedDataSource[index].compressFileSize = result.compressFileSize
            } else {
                // 压缩失败，更新状态
                updatedDataSource[index].status = 3
            }
            // 更新图片列表
            setDataSource([...updatedDataSource])
            // 全部执行执行后的处理
            if (index === updatedDataSource.length - 1) {
                // 处理成功的数量
                let successCount = 0
                // 处理失败的数量
                let failCount = 0
                // 累计成功和失败的数量
                for (let i = 0; i < updatedDataSource.length; i++) {
                    if (updatedDataSource[i].status === 2) {
                        successCount++
                    } else if (dataSource[i].status === 3) {
                        failCount++
                    }
                }
                // 弹出处理结果通知框
                setNotificationInfo({
                    type: 'success',
                    message: '压缩完成',
                    description: `成功 ${successCount} 个，失败 ${failCount} 个。`
                })
            }
        }
        // 取消loading状态
        setLoading(false)
    }

    return (
        <div className="P-home">
            <div className="settings-con">
                <div className="settings">
                    <div className="item">
                        <Button
                            type="primary"
                            icon={<ImportOutlined />}
                            onClick={handleSetInputPath}
                        >
                            设置输入目录
                        </Button>
                        <span className="path">{inputPath}</span>
                    </div>
                    <div className="item">
                        <Button
                            type="primary"
                            icon={<ExportOutlined />}
                            onClick={handleSetOutputPath}
                        >
                            设置输出目录
                        </Button>
                        <span className="path">{outputPath}</span>
                    </div>
                    <div className="item-slider">
                        <FrownOutlined />
                        <Slider
                            min={1}
                            max={10}
                            tooltip={{ formatter: (value) => `压缩质量：${value}` }}
                            onChange={setQuality}
                            value={quality}
                            className="slider-con"
                        />
                        <SmileOutlined />
                    </div>
                </div>
                <Button
                    className="opt-button"
                    color="green"
                    variant="solid"
                    size="large"
                    onClick={handleStartCompress}
                    loading={loading}
                >
                    开始压缩
                </Button>
            </div>
            <div className="table-con">
                <Table dataSource={dataSource} columns={columns} pagination={false} />
            </div>
            {contextHolder}
        </div>
    )
}
