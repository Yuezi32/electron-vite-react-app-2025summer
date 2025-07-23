import ReactDOM from 'react-dom/client'
import Routers from '@renderer/router'
import { ConfigProvider } from 'antd'
import '@ant-design/v5-patch-for-react-19'
// 引入Ant Design中文语言包
import zhCN from 'antd/locale/zh_CN'
// 全局样式
import '@renderer/common/styles/frame.styl'

ReactDOM.createRoot(document.getElementById('root')).render(
    <ConfigProvider locale={zhCN}>
        <Routers />
    </ConfigProvider>
)
