import Constants from 'expo-constants'
import { Platform } from 'react-native'

// API URL - update this to your server URL
// For local development with Expo Go on a physical device, use your machine's local IP
// For emulator/simulator: use 10.0.2.2 (Android) or localhost (iOS)
const getApiUrl = () => {
    // Check for environment variable first
    if (Constants.expoConfig?.extra?.apiUrl) {
        return Constants.expoConfig.extra.apiUrl as string
    }

    // Web platform handling
    if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
            // Development: proxy to localhost:3000
            if (window.location.hostname === 'localhost') {
                return 'http://localhost:3000'
            }
            // Production: use same origin (assumes server is on same host)
            return window.location.origin
        }
        return 'http://localhost:3000'
    }

    // Default for native development
    if (__DEV__) {
        // For Android emulator use 10.0.2.2, for iOS simulator use localhost
        // For physical devices, use your computer's local network IP
        return 'http://localhost:3000'
    }

    // Production URL for native
    return 'https://api.yourapp.com'
}

export const API_URL = getApiUrl()

export const APP_SCHEME = 'air'
