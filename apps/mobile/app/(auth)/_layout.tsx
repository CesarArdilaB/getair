import { Stack } from 'expo-router'

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#fff' },
            }}
        >
            <Stack.Screen name="login" />
            <Stack.Screen name="sign-up" />
            <Stack.Screen name="reset-password" />
        </Stack>
    )
}
