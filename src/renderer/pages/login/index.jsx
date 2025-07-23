import { Button, Input } from 'antd'
import imgLogo from '@renderer/common/images/logo.png'
import pkg from '@renderer/../../package.json'
import { useNavigate } from 'react-router-dom'
import './login.styl'

export default function Login() {
    // 创建路由hook
    const navigate = useNavigate()

    // 登录
    const handleLogin = () => {
        // 模拟登录成功,将登录信息存储到localStorage中
        window.localStorage.setItem(
            'Electron_Login_Info',
            JSON.stringify({
                uid: 1000,
                nickname: '兔子先生'
            })
        )
        // 跳转到Home页面
        navigate('/home')
    }

    return (
        <div className="P-login">
            <img src={imgLogo} alt="" className="logo" />
            <h1>图片压缩小工具 v{pkg.version}</h1>
            <div className="ipt-con">
                <Input placeholder="账号" />
            </div>
            <div className="ipt-con">
                <Input.Password placeholder="密码" />
            </div>
            <div className="ipt-con">
                <Button type="primary" block={true} onClick={handleLogin}>
                    登录
                </Button>
            </div>
        </div>
    )
}
