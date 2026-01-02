/**
 * Platform-safe alert utility.
 * Uses window.alert on web, Alert.alert on native.
 */

import { Alert, Platform } from 'react-native'

export function showAlert(title: string, message?: string) {
    if (Platform.OS === 'web') {
        window.alert(message ? `${title}\n\n${message}` : title)
    } else {
        Alert.alert(title, message)
    }
}

export function showConfirm(
    title: string,
    message?: string,
    onConfirm?: () => void,
    onCancel?: () => void,
) {
    if (Platform.OS === 'web') {
        const result = window.confirm(message ? `${title}\n\n${message}` : title)
        if (result) {
            onConfirm?.()
        } else {
            onCancel?.()
        }
    } else {
        Alert.alert(title, message, [
            { text: 'Cancel', style: 'cancel', onPress: onCancel },
            { text: 'OK', onPress: onConfirm },
        ])
    }
}
