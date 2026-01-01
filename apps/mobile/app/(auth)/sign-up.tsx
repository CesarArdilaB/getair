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

export default function SignUpScreen() {
    const auth = useAuth()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSignUp = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields')
            return
        }

        if (password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters')
            return
        }

        setLoading(true)
        try {
            const result = await auth.signUp.email({
                name,
                email,
                password,
            })

            if (result.error) {
                Alert.alert('Sign Up Failed', result.error.message)
            } else {
                router.replace('/(tabs)')
            }
        } catch (_error) {
            Alert.alert('Error', 'An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignUp = async () => {
        setLoading(true)
        try {
            await auth.signIn.social({
                provider: 'google',
            })
        } catch (_error) {
            Alert.alert('Error', 'Google sign-up failed')
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
                            Create account
                        </Text>
                        <Text className="mt-2 text-muted-foreground">
                            Sign up to get started
                        </Text>
                    </View>

                    <View className="gap-4">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            autoComplete="name"
                        />

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
                            placeholder="Create a password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            autoComplete="password-new"
                        />

                        <Text className="text-sm text-muted-foreground">
                            Password must be at least 8 characters
                        </Text>

                        <Button onPress={handleSignUp} loading={loading}>
                            Create Account
                        </Button>

                        <View className="flex-row items-center gap-4 py-4">
                            <View className="h-px flex-1 bg-border" />
                            <Text className="text-muted-foreground">or</Text>
                            <View className="h-px flex-1 bg-border" />
                        </View>

                        <Button
                            variant="outline"
                            onPress={handleGoogleSignUp}
                            disabled={loading}
                        >
                            Continue with Google
                        </Button>
                    </View>

                    <View className="mt-8 flex-row justify-center gap-1">
                        <Text className="text-muted-foreground">
                            Already have an account?
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
