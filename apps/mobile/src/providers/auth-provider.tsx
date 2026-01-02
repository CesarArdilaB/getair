import { webStorage } from '@shared/auth/storage'
import {
    createUniversalAuthClient,
    type UniversalAuthClient,
} from '@shared/auth/universal'
import {
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react'
import { Platform } from 'react-native'
import { API_URL, APP_SCHEME } from '../constants'

type AuthContextType = UniversalAuthClient

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authClient, setAuthClient] = useState<AuthContextType | null>(null)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        async function initAuth() {
            if (Platform.OS === 'web') {
                // Web uses localStorage
                const client = createUniversalAuthClient({
                    baseURL: API_URL,
                    scheme: APP_SCHEME,
                    storagePrefix: 'air',
                    storage: webStorage,
                })
                setAuthClient(client)
            } else {
                // Native platforms use SecureStore
                const { createNativeStorage } = await import(
                    '@shared/auth/storage/native'
                )
                const nativeStorage = await createNativeStorage()
                const client = createUniversalAuthClient({
                    baseURL: API_URL,
                    scheme: APP_SCHEME,
                    storagePrefix: 'air',
                    storage: nativeStorage,
                })
                setAuthClient(client)
            }
            setIsReady(true)
        }
        initAuth()
    }, [])

    if (!isReady || !authClient) {
        return null // Loading state - could add a splash screen here
    }

    return (
        <AuthContext.Provider value={authClient}>{children}</AuthContext.Provider>
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
