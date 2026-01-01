import { ApiProvider } from '@shared/api/client'
import { Toaster } from '@shared/components/ui'
import { RouterProvider } from 'react-router'
import { router } from './routers/root'

const API_URL = window.location.origin

export function App() {
    return (
        <>
            <Toaster />
            <ApiProvider url={API_URL}>
                <RouterProvider router={router} />
            </ApiProvider>
        </>
    )
}
