import { Text, View, type ViewProps } from 'react-native'
import { cn } from '@/lib/utils'

export interface CardProps extends ViewProps {
    children: React.ReactNode
}

export function Card({ className, children, ...props }: CardProps) {
    return (
        <View
            className={cn(
                'rounded-xl border border-border bg-background p-4 shadow-sm',
                className,
            )}
            {...props}
        >
            {children}
        </View>
    )
}

export function CardHeader({ className, children, ...props }: CardProps) {
    return (
        <View className={cn('pb-4', className)} {...props}>
            {children}
        </View>
    )
}

export function CardTitle({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) {
    return (
        <Text className={cn('text-xl font-bold text-foreground', className)}>
            {children}
        </Text>
    )
}

export function CardDescription({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) {
    return (
        <Text className={cn('text-sm text-muted-foreground', className)}>
            {children}
        </Text>
    )
}

export function CardContent({ className, children, ...props }: CardProps) {
    return (
        <View className={cn('', className)} {...props}>
            {children}
        </View>
    )
}

export function CardFooter({ className, children, ...props }: CardProps) {
    return (
        <View
            className={cn('flex-row items-center pt-4', className)}
            {...props}
        >
            {children}
        </View>
    )
}
