import { RouterProvider } from 'react-router-dom'
import globalRouter from '@renderer/router/globalRouter'

function Routers() {
    return <RouterProvider router={globalRouter} />
}

export default Routers
