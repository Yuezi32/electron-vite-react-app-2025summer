import { useState } from 'react'
import { Button, Modal } from 'antd'
import imgLogo from '@renderer/common/images/logo.png'
import imgElectron from '@renderer/common/images/electron.svg'
import imgChrome from '@renderer/common/images/chrome.svg'
import imgNodejs from '@renderer/common/images/nodejs.svg'
import pkg from '@renderer/../../package.json'
import './appAboutModal.styl'

function AppAboutModal({ onClose }) {
    // window.electron 是通过 preload.js 注入到渲染进程的
    // window.electron 只能在Electron环境中使用，无法在浏览器环境中使用
    const versions = window.electron ? window.electron.process.versions : null
    // Antd的modal组件hook
    const [modal, contextHolder] = Modal.useModal()
    // 正在检查更新loading
    const [checkUpdateLoading, setCheckUpdateLoading] = useState(false)
    // 安装包下载进度
    const [downloadProgress, setDownloadProgress] = useState(-1)
    // 安装包下载状态。default=默认，downloading=下载中，ready=下载完成，failed=下载失败
    const [updateStatus, setUpdateStatus] = useState('default')

    // 检查更新
    const checkForUpdate = () => {
        setCheckUpdateLoading(true)
        // 通过preload.js向主进程发送消息
        window.api.appCheckUpdate((event, result) => {
            setCheckUpdateLoading(false)
            if (result.hasUpdate) {
                modal.confirm({
                    title: `发现新版本v${result.version}，是否立即下载并安装？`,
                    onOk: downloadUpdate
                })
            } else if (!result.error) {
                modal.success({
                    title: '当前已是最新版本。'
                })
            } else {
                setUpdateStatus('failed')
                console.error('检查更新失败', result.message)
            }
        })
    }

    // 下载安装包
    const downloadUpdate = () => {
        // 通过preload.js向主进程发送消息
        setUpdateStatus('downloading')
        setDownloadProgress(0)
        window.api.appDownloadUpdate((event, result) => {
            if (result.status === 'downloading') {
                setDownloadProgress(Math.round(result.progress))
            } else if (result.status === 'done') {
                setUpdateStatus('ready')
            } else if (result.status === 'failed') {
                setUpdateStatus('failed')
                console.error('下载失败', result.message)
            }
        })
    }

    // 重试更新
    const retryUpdate = () => {
        checkForUpdate()
    }

    // 关闭应用并安装更新
    const quitAndInstall = () => {
        modal.confirm({
            title: `现在关闭软件并立即更新吗？`,
            onOk: () => {
                // 通过preload.js向主进程发送消息
                window.api.appQuitAndInstall()
            }
        })
    }

    return (
        <Modal
            className="M-appAboutModal"
            centered
            width={600}
            styles={{ body: { minHeight: 220 } }}
            maskClosable={false}
            open={true}
            title="关于软件"
            onCancel={() => {
                onClose()
            }}
            footer={null}
        >
            <div className="about-con">
                <div className="logo-con">
                    <img src={imgLogo} alt="" height={80} />
                    <p>图片压缩小工具 v{pkg.version}</p>
                    <p style={{ marginTop: 10 }}>
                        {updateStatus === 'default' && (
                            <Button
                                type="primary"
                                onClick={checkForUpdate}
                                loading={checkUpdateLoading}
                                disabled={!window.api}
                            >
                                {window.api ? '检查更新' : '检查更新（不支持Web）'}
                            </Button>
                        )}
                        {updateStatus === 'downloading' && (
                            <span>正在下载更新：{downloadProgress}%</span>
                        )}
                        {updateStatus === 'failed' && (
                            <span className="error">
                                更新失败
                                <Button
                                    type="primary"
                                    size="small"
                                    onClick={retryUpdate}
                                    style={{ marginLeft: 8 }}
                                >
                                    重试
                                </Button>
                            </span>
                        )}
                        {updateStatus === 'ready' && (
                            <span className="success">
                                下载完成
                                <Button
                                    type="primary"
                                    size="small"
                                    onClick={quitAndInstall}
                                    style={{ marginLeft: 8 }}
                                >
                                    立即安装
                                </Button>
                            </span>
                        )}
                    </p>
                </div>
                <div className="core-con">
                    <p>内核版本：</p>
                    <p>
                        <img src={imgElectron} alt="" width={20} />
                        Electron {versions ? 'v' + versions.electron : '请在Electron中查看'}
                    </p>
                    <p>
                        <img src={imgChrome} alt="" width={20} />
                        Chromium {versions ? 'v' + versions.chrome : '请在Electron中查看'}
                    </p>
                    <p>
                        <img src={imgNodejs} alt="" width={20} />
                        Node.js {versions ? 'v' + versions.node : '请在Electron中查看'}
                    </p>
                </div>
            </div>
            {contextHolder}
        </Modal>
    )
}

export default AppAboutModal
