/**
 * Service Worker for Air PWA
 * Provides basic caching and offline support
 */

const CACHE_NAME = 'air-v1'

// Files to cache on install
const STATIC_ASSETS = ['/', '/manifest.json']

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS)
        }),
    )
    // Activate immediately
    self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name)),
            )
        }),
    )
    // Take control of all pages immediately
    self.clients.claim()
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return

    // Skip API requests (should not be cached)
    if (event.request.url.includes('/api/')) return

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone response for caching
                const responseClone = response.clone()
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone)
                })
                return response
            })
            .catch(() => {
                // Fallback to cache
                return caches.match(event.request)
            }),
    )
})
