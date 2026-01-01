import { forwardRef } from 'react'
import { Text, TextInput, type TextInputProps, View } from 'react-native'
import { cn } from '@/lib/utils'

export interface InputProps extends TextInputProps {
    label?: string
    error?: string
}

export const Input = forwardRef<TextInput, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <View className="w-full">
                {label && (
                    <Text className="mb-2 text-sm font-medium text-foreground">
                        {label}
                    </Text>
                )}
                <TextInput
                    ref={ref}
                    className={cn(
                        'h-12 w-full rounded-lg border border-border bg-background px-4 text-base text-foreground',
                        'focus:border-primary',
                        error && 'border-destructive',
                        className,
                    )}
                    placeholderTextColor="#737373"
                    {...props}
                />
                {error && (
                    <Text className="mt-1 text-sm text-destructive">
                        {error}
                    </Text>
                )}
            </View>
        )
    },
)

Input.displayName = 'Input'
