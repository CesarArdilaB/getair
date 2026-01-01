import { cms } from '@packages/cms'
import { posts } from '@packages/posts'
import { router } from '@shared/api-helpers'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

export const appRouter = router({
    cms,
    posts,
})

export type AppRouter = typeof appRouter
export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>
