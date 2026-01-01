import { Link, router } from 'expo-router'
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

export default function LoginScreen() {
    const auth = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields')
            return
        }

        setLoading(true)
        try {
            const result = await auth.signIn.email({
                email,
                password,
            })

            if (result.error) {
                Alert.alert('Login Failed', result.error.message)
            } else {
                router.replace('/(tabs)')
            }
        } catch (_error) {
            Alert.alert('Error', 'An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setLoading(true)
        try {
            await auth.signIn.social({
                provider: 'google',
            })
        } catch (_error) {
            Alert.alert('Error', 'Google sign-in failed')
        } finally {
            setLoading(false)
        }
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
                            Welcome back
                        </Text>
                        <Text className="mt-2 text-muted-foreground">
                            Sign in to your account
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

                        <Input
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            autoComplete="password"
                        />

                        <Link
                            href="/(auth)/reset-password"
                            className="self-end text-sm text-primary"
                        >
                            Forgot password?
                        </Link>

                        <Button onPress={handleLogin} loading={loading}>
                            Sign In
                        </Button>

                        <View className="flex-row items-center gap-4 py-4">
                            <View className="h-px flex-1 bg-border" />
                            <Text className="text-muted-foreground">or</Text>
                            <View className="h-px flex-1 bg-border" />
                        </View>

                        <Button
                            variant="outline"
                            onPress={handleGoogleLogin}
                            disabled={loading}
                        >
                            Continue with Google
                        </Button>
                    </View>

                    <View className="mt-8 flex-row justify-center gap-1">
                        <Text className="text-muted-foreground">
                            Don't have an account?
                        </Text>
                        <Link
                            href="/(auth)/sign-up"
                            className="font-semibold text-primary"
                        >
                            Sign up
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
