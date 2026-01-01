import { Ionicons } from '@expo/vector-icons'
import { Redirect, Tabs } from 'expo-router'
import { FullScreenSpinner } from '../../src/components'
import { useAuth } from '../../src/providers'

export default function TabsLayout() {
    const auth = useAuth()
    const { data: session, isPending } = auth.useSession()

    if (isPending) {
        return <FullScreenSpinner />
    }

    if (!session) {
        return <Redirect href="/(auth)/login" />
    }

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#0284c7',
                tabBarInactiveTintColor: '#737373',
                headerShown: true,
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: '#e5e5e5',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="home-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="posts"
                options={{
                    title: 'Posts',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="document-text-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="person-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    )
}
