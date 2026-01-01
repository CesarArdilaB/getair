import { expoClient } from '@better-auth/expo'
import { createAuthClient as betterAuthCreateAuthClient } from 'better-auth/react'
import type * as SecureStore from 'expo-secure-store'

export type ExpoAuthClientOptions = {
    baseURL: string
    scheme: string
    storagePrefix?: string
    storage: typeof SecureStore
}

export function createExpoAuthClient(options: ExpoAuthClientOptions) {
    return betterAuthCreateAuthClient({
        basePath: '/api/auth',
        baseURL: options.baseURL,
        plugins: [
            expoClient({
                scheme: options.scheme,
                storagePrefix: options.storagePrefix ?? 'ignite',
                storage: options.storage,
            }),
        ],
    })
}

export type ExpoAuthClient = ReturnType<typeof createExpoAuthClient>
