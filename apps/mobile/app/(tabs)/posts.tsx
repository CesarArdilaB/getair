import { useTRPC } from '@shared/api/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Spinner,
} from '../../src/components'

export default function PostsScreen() {
    const trpc = useTRPC()
    const queryClient = useQueryClient()
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')

    const {
        data: posts,
        isLoading,
        refetch,
        isRefetching,
    } = trpc.posts.list.useQuery()

    const createPost = useMutation(
        trpc.posts.create.mutationOptions({
            onSuccess: () => {
                setTitle('')
                setContent('')
                queryClient.invalidateQueries({ queryKey: ['posts', 'list'] })
            },
            onError: (error) => {
                Alert.alert('Error', error.message)
            },
        }),
    )

    const handleCreatePost = () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title')
            return
        }
        createPost.mutate({ title, content })
    }

    return (
        <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
            <ScrollView
                className="flex-1 px-4 py-6"
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                    />
                }
            >
                {/* Create Post Form */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Create Post</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <View className="gap-3">
                            <Input
                                placeholder="Post title"
                                value={title}
                                onChangeText={setTitle}
                            />
                            <TextInput
                                className="min-h-[100px] rounded-lg border border-border bg-background p-3 text-base text-foreground"
                                placeholder="What's on your mind?"
                                placeholderTextColor="#737373"
                                value={content}
                                onChangeText={setContent}
                                multiline
                                textAlignVertical="top"
                            />
                            <Button
                                onPress={handleCreatePost}
                                loading={createPost.isPending}
                            >
                                Create Post
                            </Button>
                        </View>
                    </CardContent>
                </Card>

                {/* Posts List */}
                <Text className="mb-4 text-xl font-bold text-foreground">
                    Recent Posts
                </Text>

                {isLoading ? (
                    <Spinner className="py-8" />
                ) : posts && posts.length > 0 ? (
                    <View className="gap-4">
                        {posts.map((post) => (
                            <Card key={post.id}>
                                <CardHeader>
                                    <CardTitle>{post.title}</CardTitle>
                                </CardHeader>
                                {post.content && (
                                    <CardContent>
                                        <Text className="text-muted-foreground">
                                            {post.content}
                                        </Text>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </View>
                ) : (
                    <View className="items-center py-8">
                        <Text className="text-muted-foreground">
                            No posts yet. Create your first post!
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}
