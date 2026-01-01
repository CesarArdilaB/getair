# Create New Mobile Screen

Create a new screen for the React Native mobile app.

## Arguments

- `$ARGUMENTS` - Name of the screen (e.g., `settings`, `notifications`, `(tabs)/settings`)

## Instructions

1. **Parse the screen name and location**:
   - If name includes path prefix like `(auth)/` or `(tabs)/`, create in that route group
   - Otherwise, ask where to place the screen

2. **Create the screen file** at `apps/mobile/app/<path>/<name>.tsx`:

```tsx
import { View, Text, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function <Name>Screen() {
    return (
        <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
            <ScrollView className="flex-1 px-4 py-6">
                <Text className="text-2xl font-bold text-foreground">
                    <Title>
                </Text>

                {/* Screen content */}
            </ScrollView>
        </SafeAreaView>
    )
}
```

3. **If screen needs tRPC data**, add the hook:

```tsx
import { useTRPC } from '@shared/api/client'

export default function <Name>Screen() {
    const trpc = useTRPC()
    const { data, isLoading } = trpc.<router>.<procedure>.useQuery()

    // ...
}
```

4. **If screen needs authentication check**:

```tsx
import { useAuth } from '../../src/providers'
import { Redirect } from 'expo-router'
import { FullScreenSpinner } from '../../src/components'

export default function <Name>Screen() {
    const auth = useAuth()
    const { data: session, isPending } = auth.useSession()

    if (isPending) return <FullScreenSpinner />
    if (!session) return <Redirect href="/(auth)/login" />

    // ...
}
```

5. **If adding to tabs**, update `apps/mobile/app/(tabs)/_layout.tsx`:

```tsx
<Tabs.Screen
    name="<name>"
    options={{
        title: '<Title>',
        tabBarIcon: ({ color, size }) => (
            <Ionicons name="<icon>-outline" size={size} color={color} />
        ),
    }}
/>
```

6. **Common patterns**:

   **Form screen**:
   ```tsx
   import { useState } from 'react'
   import { KeyboardAvoidingView, Platform } from 'react-native'
   import { Button, Input } from '../../src/components'
   ```

   **List screen with pull-to-refresh**:
   ```tsx
   import { RefreshControl } from 'react-native'

   <ScrollView
       refreshControl={
           <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
       }
   >
   ```

   **Modal screen**:
   ```tsx
   // In _layout.tsx
   <Stack.Screen
       name="<name>"
       options={{
           presentation: 'modal',
           headerShown: true,
       }}
   />
   ```

7. **Available UI components** (from `../../src/components`):
   - `Button` - with variants: default, destructive, outline, secondary, ghost, link
   - `Input` - with label and error props
   - `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
   - `Spinner`, `FullScreenSpinner`

8. **Icons**: Use `@expo/vector-icons` Ionicons:
   ```tsx
   import { Ionicons } from '@expo/vector-icons'
   <Ionicons name="settings-outline" size={24} color="#0284c7" />
   ```

9. **Navigation**:
   ```tsx
   import { router, Link } from 'expo-router'

   // Programmatic
   router.push('/(tabs)/settings')
   router.replace('/(auth)/login')
   router.back()

   // Declarative
   <Link href="/(tabs)/settings">Go to Settings</Link>
   ```
