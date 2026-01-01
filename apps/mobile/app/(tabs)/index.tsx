import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components'
import { useAuth } from '../../src/providers'

export default function HomeScreen() {
    const auth = useAuth()
    const { data: session } = auth.useSession()

    return (
        <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
            <ScrollView className="flex-1 px-4 py-6">
                <Text className="mb-6 text-2xl font-bold text-foreground">
                    Welcome, {session?.user?.name ?? 'User'}!
                </Text>

                <View className="gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Getting Started</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Text className="text-muted-foreground">
                                This is your Ignite mobile app. Start building
                                amazing features with React Native and Expo.
                            </Text>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Connected to API</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Text className="text-muted-foreground">
                                Your app is connected to the backend via tRPC.
                                Check out the Posts tab to see it in action.
                            </Text>
                        </CardContent>
                    </Card>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
