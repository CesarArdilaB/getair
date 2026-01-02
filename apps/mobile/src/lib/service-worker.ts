/**
 * Service Worker registration for PWA support.
 * Only runs on web platform.
 */

import { Platform } from 'react-native'

export function registerServiceWorker() {
    if (Platform.OS !== 'web') return
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
                console.log('SW registered:', registration.scope)
            })
            .catch((error) => {
                console.log('SW registration failed:', error)
            })
    })
}
