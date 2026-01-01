import { createExpoAuthClient } from '@shared/auth/expo'
import * as SecureStore from 'expo-secure-store'
import { createContext, type ReactNode, useContext, useMemo } from 'react'
import { API_URL, APP_SCHEME } from '../constants'

const authClient = createExpoAuthClient({
    baseURL: API_URL,
    scheme: APP_SCHEME,
    storagePrefix: 'ignite',
    storage: SecureStore,
})

type AuthContextType = typeof authClient

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const client = useMemo(() => authClient, [])

    return (
        <AuthContext.Provider value={client}>{children}</AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

// Re-export the auth client for direct usage
export { authClient }
