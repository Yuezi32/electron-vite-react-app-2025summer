import { createHashRouter, Navigate } from 'react-router-dom'
import Login from '@renderer/pages/login'
import Entry from '@renderer/pages/entry'
import Home from '@renderer/pages/home'

// 全局路由
function globalRoute() {
    return createHashRouter([
        {
            // 精确匹配"/login"，跳转Login页面
            path: '/login',
            element: <Login />
        },
        {
            // 未匹配"/login"，则进入到Entry页面
            path: '/',
            element: <Entry />,
            // 定义Entry二级路由
            children: [
                {
                    // 精确匹配"/home"，跳转Home页面
                    path: '/home',
                    element: <Home />
                },
                {
                    // 如果URL没有"#路由"，跳转Home页面
                    path: '/',
                    element: <Navigate to="/home" />
                },
                {
                    // 未匹配，跳转Login页面
                    path: '*',
                    element: <Navigate to="/login" />
                }
            ]
        }
    ])
}

const globalRouter = globalRoute()

export default globalRouter
