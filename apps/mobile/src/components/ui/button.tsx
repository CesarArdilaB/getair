import { cva, type VariantProps } from 'class-variance-authority'
import {
    ActivityIndicator,
    Pressable,
    type PressableProps,
    Text,
} from 'react-native'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
    'flex-row items-center justify-center rounded-lg active:opacity-80',
    {
        variants: {
            variant: {
                default: 'bg-primary',
                destructive: 'bg-destructive',
                outline: 'border border-border bg-transparent',
                secondary: 'bg-muted',
                ghost: 'bg-transparent',
                link: 'bg-transparent',
            },
            size: {
                default: 'h-12 px-4',
                sm: 'h-10 px-3',
                lg: 'h-14 px-6',
                icon: 'h-12 w-12',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
)

const buttonTextVariants = cva('font-semibold', {
    variants: {
        variant: {
            default: 'text-white',
            destructive: 'text-destructive-foreground',
            outline: 'text-foreground',
            secondary: 'text-foreground',
            ghost: 'text-foreground',
            link: 'text-primary underline',
        },
        size: {
            default: 'text-base',
            sm: 'text-sm',
            lg: 'text-lg',
            icon: 'text-base',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
})

export interface ButtonProps
    extends PressableProps,
        VariantProps<typeof buttonVariants> {
    loading?: boolean
    children: React.ReactNode
}

export function Button({
    className,
    variant,
    size,
    loading,
    disabled,
    children,
    ...props
}: ButtonProps) {
    return (
        <Pressable
            className={cn(
                buttonVariants({ variant, size }),
                (disabled || loading) && 'opacity-50',
                className,
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'default' ? '#fff' : '#0284c7'}
                    size="small"
                />
            ) : typeof children === 'string' ? (
                <Text className={cn(buttonTextVariants({ variant, size }))}>
                    {children}
                </Text>
            ) : (
                children
            )}
        </Pressable>
    )
}
