/**
 * Native storage adapter using expo-secure-store.
 * Only imported on native platforms (iOS/Android).
 */

import type { StorageAdapter } from './index'

/**
 * Creates a native storage adapter wrapping expo-secure-store.
 * This is dynamically imported only on native platforms to avoid
 * bundling expo-secure-store on web.
 */
export async function createNativeStorage(): Promise<StorageAdapter> {
    const SecureStore = await import('expo-secure-store')
    return {
        getItem: SecureStore.getItemAsync,
        setItem: SecureStore.setItemAsync,
        deleteItem: SecureStore.deleteItemAsync,
    }
}
