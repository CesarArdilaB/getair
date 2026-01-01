import type { ReactNode } from 'react'
import { ApiProvider } from './api-provider'
import { AuthProvider } from './auth-provider'

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <ApiProvider>{children}</ApiProvider>
        </AuthProvider>
    )
}

export { ApiProvider } from './api-provider'
export { AuthProvider, authClient, useAuth } from './auth-provider'
