import { ActivityIndicator, View } from 'react-native'
import { cn } from '@/lib/utils'

export interface SpinnerProps {
    size?: 'small' | 'large'
    color?: string
    className?: string
}

export function Spinner({
    size = 'large',
    color = '#0284c7',
    className,
}: SpinnerProps) {
    return (
        <View className={cn('items-center justify-center', className)}>
            <ActivityIndicator size={size} color={color} />
        </View>
    )
}

export function FullScreenSpinner() {
    return (
        <View className="flex-1 items-center justify-center bg-background">
            <Spinner />
        </View>
    )
}
