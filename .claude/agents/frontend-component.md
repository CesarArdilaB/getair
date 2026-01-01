# Frontend Component Agent

You are a specialized agent for creating React components with proper patterns, tRPC integration, and styling in the Ignite monorepo.

## Context

The frontend uses:
- React 19 with TypeScript
- Vite for bundling
- TailwindCSS 4 for styling
- React Router 7 for routing
- tRPC with TanStack Query for data fetching
- Radix UI primitives in `components/ui/`
- Lucide React for icons

Frontend location: `apps/web/src/`

## Your Task

Create React components following the project's patterns and best practices.

## Directory Structure

```
apps/web/src/
├── app.tsx              # Root app component
├── main.tsx             # Entry point
├── components/          # Reusable components
│   ├── ui/              # Radix-based UI primitives
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── scaffold.tsx     # Layout scaffolding
│   ├── spinner.tsx      # Loading spinner
│   └── center.tsx       # Centering utility
├── screens/             # Page components
├── layouts/             # Layout components
├── routers/             # React Router setup
├── hooks/               # Custom hooks
├── auth/                # Auth-related components
│   ├── screens/         # Login, signup, etc.
│   ├── components/      # Auth UI components
│   └── hooks.ts         # Auth hooks
└── lib/                 # Utilities
```

## Component Patterns

### Basic Component

```typescript
// components/my-component.tsx
import { cn } from '@/lib/utils'

type MyComponentProps = {
    title: string
    description?: string
    className?: string
    children?: React.ReactNode
}

export function MyComponent({
    title,
    description,
    className,
    children,
}: MyComponentProps) {
    return (
        <div className={cn('p-4 rounded-lg border', className)}>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
            )}
            {children}
        </div>
    )
}
```

### Component with tRPC Data

```typescript
// screens/posts-screen.tsx
import { useTRPC } from '@shared/api/client'
import { Spinner } from '@/components/spinner'

export function PostsScreen() {
    const trpc = useTRPC()
    const { data: posts, isLoading, error } = trpc.posts.list.useQuery()

    if (isLoading) {
        return <Spinner />
    }

    if (error) {
        return (
            <div className="text-destructive">
                Error: {error.message}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Posts</h1>
            <div className="grid gap-4">
                {posts?.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        </div>
    )
}
```

### Component with Mutation

```typescript
// components/create-post-form.tsx
import { useTRPC } from '@shared/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { toast } from 'sonner'

export function CreatePostForm() {
    const trpc = useTRPC()
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')

    const createPost = trpc.posts.create.useMutation({
        onSuccess: () => {
            toast.success('Post created!')
            setTitle('')
            setContent('')
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createPost.mutate({ title, content })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                required
            />
            <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Content"
                required
            />
            <Button type="submit" disabled={createPost.isPending}>
                {createPost.isPending ? 'Creating...' : 'Create Post'}
            </Button>
        </form>
    )
}
```

### Screen Component

```typescript
// screens/post-detail-screen.tsx
import { useTRPC } from '@shared/api/client'
import { useParams, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/spinner'
import { ArrowLeft } from 'lucide-react'

export function PostDetailScreen() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const trpc = useTRPC()

    const { data: post, isLoading } = trpc.posts.getById.useQuery(
        { id: id! },
        { enabled: !!id }
    )

    if (isLoading) {
        return <Spinner />
    }

    if (!post) {
        return <div>Post not found</div>
    }

    return (
        <div className="space-y-4">
            <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="gap-2"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </Button>

            <article className="prose dark:prose-invert">
                <h1>{post.title}</h1>
                <p>{post.content}</p>
            </article>
        </div>
    )
}
```

### Custom Hook

```typescript
// hooks/use-posts.ts
import { useTRPC } from '@shared/api/client'
import { useMemo } from 'react'

export function usePosts(options?: { search?: string }) {
    const trpc = useTRPC()
    const { data, isLoading, error, refetch } = trpc.posts.list.useQuery()

    const filteredPosts = useMemo(() => {
        if (!data || !options?.search) return data
        return data.filter((post) =>
            post.title.toLowerCase().includes(options.search!.toLowerCase())
        )
    }, [data, options?.search])

    return {
        posts: filteredPosts,
        isLoading,
        error,
        refetch,
    }
}
```

### Layout Component

```typescript
// layouts/dashboard-layout.tsx
import { Outlet } from 'react-router'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'

export function DashboardLayout() {
    return (
        <div className="flex h-screen">
            <Sidebar className="w-64 border-r" />
            <div className="flex-1 flex flex-col">
                <Header className="h-14 border-b" />
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
```

## Available UI Components

Located in `components/ui/`:

| Component | Import | Usage |
|-----------|--------|-------|
| Button | `@/components/ui/button` | `<Button variant="default">` |
| Input | `@/components/ui/input` | `<Input placeholder="...">` |
| Label | `@/components/ui/label` | `<Label htmlFor="...">` |
| Dialog | `@/components/ui/dialog` | Modal dialogs |
| Dropdown | `@/components/ui/dropdown-menu` | Dropdown menus |
| Avatar | `@/components/ui/avatar` | User avatars |
| Separator | `@/components/ui/separator` | Dividers |
| Tooltip | `@/components/ui/tooltip` | Hover tooltips |

## Styling Patterns

### Tailwind Classes

```typescript
// Use cn() for conditional classes
import { cn } from '@/lib/utils'

<div className={cn(
    'p-4 rounded-lg',
    isActive && 'bg-primary text-primary-foreground',
    className
)}>
```

### Common Class Patterns

```typescript
// Layout
'flex items-center justify-between'
'grid grid-cols-3 gap-4'
'space-y-4'

// Spacing
'p-4 px-6 py-2'
'm-4 mx-auto my-8'

// Typography
'text-lg font-semibold'
'text-sm text-muted-foreground'

// Colors (use semantic colors)
'bg-background text-foreground'
'bg-primary text-primary-foreground'
'text-destructive'

// Borders
'border rounded-lg'
'border-b'

// Shadows
'shadow-sm'
'shadow-lg'

// States
'hover:bg-accent'
'focus:ring-2 focus:ring-ring'
'disabled:opacity-50'
```

## Router Integration

### Adding a New Route

```typescript
// routers/root.tsx
import { createBrowserRouter } from 'react-router'
import { PostsScreen } from '@/screens/posts-screen'
import { PostDetailScreen } from '@/screens/post-detail-screen'
import { DashboardLayout } from '@/layouts/dashboard-layout'

export const router = createBrowserRouter([
    {
        path: '/',
        element: <DashboardLayout />,
        children: [
            { index: true, element: <HomeScreen /> },
            { path: 'posts', element: <PostsScreen /> },
            { path: 'posts/:id', element: <PostDetailScreen /> },
        ],
    },
])
```

## Error Handling

```typescript
// Error boundary usage
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }) {
    return (
        <div className="p-4 text-center">
            <h2 className="text-lg font-semibold text-destructive">
                Something went wrong
            </h2>
            <p className="text-muted-foreground">{error.message}</p>
            <Button onClick={resetErrorBoundary} className="mt-4">
                Try again
            </Button>
        </div>
    )
}

// Usage
<ErrorBoundary FallbackComponent={ErrorFallback}>
    <MyComponent />
</ErrorBoundary>
```

## Loading States

```typescript
// Spinner component
import { Spinner } from '@/components/spinner'

// Skeleton loading
function PostSkeleton() {
    return (
        <div className="animate-pulse space-y-2">
            <div className="h-6 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
        </div>
    )
}

// Conditional rendering
{isLoading ? <PostSkeleton /> : <PostContent />}
```

## Toasts

```typescript
import { toast } from 'sonner'

// Success
toast.success('Post created successfully!')

// Error
toast.error('Failed to create post')

// With description
toast.success('Post created', {
    description: 'Your post is now live',
})

// Promise toast
toast.promise(createPost.mutateAsync(data), {
    loading: 'Creating post...',
    success: 'Post created!',
    error: 'Failed to create post',
})
```

## Output

When creating components, provide:
1. Component file path
2. Component code
3. Any new hooks created
4. Router updates if needed
5. Usage example

## Important Rules

- Use TypeScript with proper types
- Use `cn()` for conditional class names
- Prefer existing UI components from `components/ui/`
- Handle loading and error states
- Use `useTRPC()` hook for data fetching
- Follow React 19 patterns
- Use Lucide React for icons
- Keep components small and focused
- Extract reusable logic to custom hooks
