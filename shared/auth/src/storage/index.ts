/**
 * Platform-agnostic storage abstraction for auth tokens.
 * Web uses localStorage, native uses expo-secure-store.
 */

export interface StorageAdapter {
    getItem: (key: string) => Promise<string | null>
    setItem: (key: string, value: string) => Promise<void>
    deleteItem: (key: string) => Promise<void>
}

/**
 * Web storage adapter using localStorage.
 * Used when Platform.OS === 'web'
 */
export const webStorage: StorageAdapter = {
    getItem: async (key: string) => {
        if (typeof window === 'undefined') return null
        return localStorage.getItem(key)
    },
    setItem: async (key: string, value: string) => {
        if (typeof window === 'undefined') return
        localStorage.setItem(key, value)
    },
    deleteItem: async (key: string) => {
        if (typeof window === 'undefined') return
        localStorage.removeItem(key)
    },
}
