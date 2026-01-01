import Constants from 'expo-constants'

// API URL - update this to your server URL
// For local development with Expo Go on a physical device, use your machine's local IP
// For emulator/simulator: use 10.0.2.2 (Android) or localhost (iOS)
const getApiUrl = () => {
    // Check for environment variable first
    if (Constants.expoConfig?.extra?.apiUrl) {
        return Constants.expoConfig.extra.apiUrl as string
    }

    // Default for development
    if (__DEV__) {
        // For Android emulator use 10.0.2.2, for iOS simulator use localhost
        // For physical devices, use your computer's local network IP
        return 'http://localhost:3000'
    }

    // Production URL
    return 'https://api.yourapp.com'
}

export const API_URL = getApiUrl()

export const APP_SCHEME = 'ignite'
