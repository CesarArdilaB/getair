import { Link } from 'expo-router'
import { useState } from 'react'
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Input } from '../../src/components'
import { useAuth } from '../../src/providers'

export default function ResetPasswordScreen() {
    const auth = useAuth()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address')
            return
        }

        setLoading(true)
        try {
            const result = await auth.forgetPassword({
                email,
                redirectTo: '/reset-password',
            })

            if (result.error) {
                Alert.alert('Error', result.error.message)
            } else {
                setSent(true)
            }
        } catch (_error) {
            Alert.alert('Error', 'An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    if (sent) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <View className="flex-1 items-center justify-center px-6">
                    <View className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Text className="text-3xl">✉️</Text>
                    </View>
                    <Text className="text-center text-2xl font-bold text-foreground">
                        Check your email
                    </Text>
                    <Text className="mt-2 text-center text-muted-foreground">
                        We've sent a password reset link to {email}
                    </Text>
                    <Link
                        href="/(auth)/login"
                        className="mt-8 font-semibold text-primary"
                    >
                        Back to login
                    </Link>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerClassName="flex-grow justify-center px-6 py-8"
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="mb-8">
                        <Text className="text-3xl font-bold text-foreground">
                            Reset password
                        </Text>
                        <Text className="mt-2 text-muted-foreground">
                            Enter your email to receive a reset link
                        </Text>
                    </View>

                    <View className="gap-4">
                        <Input
                            label="Email"
                            placeholder="you@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />

                        <Button onPress={handleResetPassword} loading={loading}>
                            Send Reset Link
                        </Button>
                    </View>

                    <View className="mt-8 flex-row justify-center gap-1">
                        <Text className="text-muted-foreground">
                            Remember your password?
                        </Text>
                        <Link
                            href="/(auth)/login"
                            className="font-semibold text-primary"
                        >
                            Sign in
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
