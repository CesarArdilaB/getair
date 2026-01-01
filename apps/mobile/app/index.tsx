import { Redirect } from 'expo-router'
import { FullScreenSpinner } from '../src/components'
import { useAuth } from '../src/providers'

export default function Index() {
    const auth = useAuth()
    const { data: session, isPending } = auth.useSession()

    if (isPending) {
        return <FullScreenSpinner />
    }

    if (session) {
        return <Redirect href="/(tabs)" />
    }

    return <Redirect href="/(auth)/login" />
}
