/**
 * Universal auth client that works on both web and native platforms.
 * Uses localStorage on web and expo-secure-store on native.
 */

import { expoClient } from '@better-auth/expo'
import { createAuthClient as betterAuthCreateAuthClient } from 'better-auth/react'
import type { StorageAdapter } from '../storage'

export type UniversalAuthClientOptions = {
    baseURL: string
    scheme: string
    storagePrefix?: string
    storage: StorageAdapter
}

/**
 * Creates an auth client that works on both web and native platforms.
 * The storage adapter determines where tokens are persisted.
 */
export function createUniversalAuthClient(options: UniversalAuthClientOptions) {
    return betterAuthCreateAuthClient({
        basePath: '/api/auth',
        baseURL: options.baseURL,
        plugins: [
            expoClient({
                scheme: options.scheme,
                storagePrefix: options.storagePrefix ?? 'air',
                storage: options.storage as any,
            }),
        ],
    })
}

export type UniversalAuthClient = ReturnType<typeof createUniversalAuthClient>
