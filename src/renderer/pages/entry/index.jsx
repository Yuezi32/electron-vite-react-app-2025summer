import { useEffect } from 'react'
import { Button, message } from 'antd'
import { Outlet, Navigate } from 'react-router-dom'
import Header from '@renderer/components/header'
import imgBalloon from '@renderer/common/images/balloon.svg'

// 简易路由守卫
function PrivateRoute(props) {
    // 判断localStorage是否有登录用户信息，如果没有则跳转登录页
    return window.localStorage.getItem('Electron_Login_Info') ? (
        props.children
    ) : (
        <Navigate to="/login" />
    )
}

export default function Entry() {
    // Antd的message组件hook
    const [messageApi, contextHolder] = message.useMessage()
    useEffect(() => {
        // 启动静默检查更新并下载
        // 这里先判断window.api是否存在是因为兼容非Electron环境（纯Web环境是没有window.api）。
        // 兼容的最终效果就是：非Electron环境（纯Web环境）不检查更新
        window.api &&
            window.api.appSilentCheckAndDownload((event, result) => {
                console.log(result.message)
                messageApi.open({
                    key: 'messageUpdate',
                    duration: 0,
                    content: (
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 6 }}>
                            <img src={imgBalloon} style={{ width: 50, height: 50 }} alt="" />
                            <div style={{ flex: 1, textAlign: 'left' }}>
                                <div style={{ fontSize: 16 }}>
                                    新版本v{result.version}已就绪，请安装更新。
                                </div>
                                <div style={{ marginTop: 6 }}>
                                    <Button
                                        onClick={() => {
                                            // 关闭新版本提示message
                                            messageApi.destroy('messageUpdate')
                                        }}
                                    >
                                        稍后再安装
                                    </Button>
                                    <Button
                                        type="primary"
                                        style={{ marginLeft: 10 }}
                                        onClick={() => {
                                            // 关闭应用并安装
                                            window.api && window.api.appQuitAndInstall()
                                        }}
                                    >
                                        立即关闭并安装
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )
                })
            })
    }, [messageApi])

    return (
        <PrivateRoute>
            <div style={{ overflow: 'hidden', height: '100%' }}>
                <Header />
                <Outlet />
            </div>
            {contextHolder}
        </PrivateRoute>
    )
}
