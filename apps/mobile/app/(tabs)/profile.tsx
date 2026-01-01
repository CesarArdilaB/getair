import { router } from 'expo-router'
import { Alert, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../../src/components'
import { useAuth } from '../../src/providers'

export default function ProfileScreen() {
    const auth = useAuth()
    const { data: session } = auth.useSession()

    const handleLogout = async () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    await auth.signOut()
                    router.replace('/(auth)/login')
                },
            },
        ])
    }

    return (
        <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
            <ScrollView className="flex-1 px-4 py-6">
                {/* User Info */}
                <Card className="mb-6">
                    <CardHeader>
                        <View className="mb-4 h-20 w-20 items-center justify-center self-center rounded-full bg-primary">
                            <Text className="text-3xl font-bold text-white">
                                {session?.user?.name?.charAt(0).toUpperCase() ??
                                    'U'}
                            </Text>
                        </View>
                        <CardTitle className="text-center">
                            {session?.user?.name ?? 'User'}
                        </CardTitle>
                        <Text className="text-center text-muted-foreground">
                            {session?.user?.email}
                        </Text>
                    </CardHeader>
                </Card>

                {/* Account Settings */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Account</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <View className="gap-2">
                            <View className="flex-row justify-between border-b border-border py-3">
                                <Text className="text-muted-foreground">
                                    Email
                                </Text>
                                <Text className="text-foreground">
                                    {session?.user?.email}
                                </Text>
                            </View>
                            <View className="flex-row justify-between border-b border-border py-3">
                                <Text className="text-muted-foreground">
                                    Member since
                                </Text>
                                <Text className="text-foreground">
                                    {session?.user?.createdAt
                                        ? new Date(
                                              session.user.createdAt,
                                          ).toLocaleDateString()
                                        : 'N/A'}
                                </Text>
                            </View>
                        </View>
                    </CardContent>
                </Card>

                {/* App Info */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <View className="gap-2">
                            <View className="flex-row justify-between py-2">
                                <Text className="text-muted-foreground">
                                    Version
                                </Text>
                                <Text className="text-foreground">1.0.0</Text>
                            </View>
                            <View className="flex-row justify-between py-2">
                                <Text className="text-muted-foreground">
                                    Build
                                </Text>
                                <Text className="text-foreground">
                                    Expo SDK 52
                                </Text>
                            </View>
                        </View>
                    </CardContent>
                </Card>

                {/* Sign Out */}
                <Button variant="destructive" onPress={handleLogout}>
                    Sign Out
                </Button>
            </ScrollView>
        </SafeAreaView>
    )
}
