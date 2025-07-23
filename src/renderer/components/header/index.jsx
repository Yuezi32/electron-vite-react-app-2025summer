import { useState } from 'react'
import { Card, Dropdown, Modal } from 'antd'
import { CaretDownOutlined, ExportOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import AppAboutModal from '@renderer/components/appAboutModal'
import logoImg from '@renderer/common/images/logo.png'
import './header.styl'

export default function Header() {
    // 创建对话框hook
    const [modal, contextHolder] = Modal.useModal()

    // 创建路由hook
    const navigate = useNavigate()

    // 是否显示关于软件的Modal
    const [showAppAboutModal, setShowAppAboutModal] = useState(false)

    // 从localStorage获取登录信息
    const loginInfo = window.localStorage.getItem('Electron_Login_Info')

    // 下拉菜单项
    const menuItems = [
        {
            label: '关于软件',
            key: 'about',
            icon: <InfoCircleOutlined />,
            onClick: () => {
                setShowAppAboutModal(true)
            }
        },
        {
            label: '退出登录',
            key: 'signout',
            icon: <ExportOutlined />,
            onClick: () => {
                modal.confirm({
                    title: '确定要退出登录么？',
                    okText: '退出',
                    onOk: () => {
                        // 清除登录信息
                        window.localStorage.removeItem('Electron_Login_Info')
                        // 跳转到登录页面
                        navigate('/login')
                    }
                })
            }
        }
    ]

    return (
        <Card className="M-header" variant="borderless">
            <div className="header-wrapper">
                <div className="logo-con">
                    <img src={logoImg} alt="" />
                    <span className="logo-text">图片压缩小工具</span>
                </div>
                <div className="header-con">
                    <Dropdown menu={{ items: menuItems }}>
                        <div className="user-menu">
                            <span>{loginInfo ? JSON.parse(loginInfo).nickname : '未登录'}</span>
                            <CaretDownOutlined className="arrow" />
                        </div>
                    </Dropdown>
                </div>
            </div>
            {showAppAboutModal && (
                <AppAboutModal
                    onClose={() => {
                        setShowAppAboutModal(false)
                    }}
                />
            )}
            {/* `contextHolder` should always be placed under the context you want to access */}
            {contextHolder}
        </Card>
    )
}
