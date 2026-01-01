# Add tRPC Middleware

Create a new tRPC middleware or custom procedure in `shared/api-helpers`.

## Middleware Name: $ARGUMENTS

## Reference: Existing Middleware

Location: `shared/api-helpers/src/index.ts`

```typescript
// Current middleware structure
const t = initTRPC.context<TRPCContext>().create({ transformer: superjson })

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    const session = await ctx.auth.getSession(ctx.req.headers)
    if (!session) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
    }
    return next({ ctx: { session, ...ctx } })
})
```

## Instructions

### Step 1: Determine Middleware Type

| Type | Use Case | Example |
|------|----------|---------|
| **Procedure** | New base procedure with auth/validation | `adminProcedure`, `rateLimitedProcedure` |
| **Middleware** | Reusable logic to compose | `withLogging`, `withRateLimit` |
| **Context Extension** | Add data to context | Add `organizationId` to ctx |

### Step 2: Create the Middleware

Edit `shared/api-helpers/src/index.ts`:

**Option A: New Procedure (extends existing)**
```typescript
/**
 * Admin-only procedure - requires authenticated admin user
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
    if (ctx.session.user.role !== 'admin') {
        throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Admin access required'
        })
    }
    return next({ ctx })
})
```

**Option B: Standalone Middleware (composable)**
```typescript
/**
 * Logging middleware - logs procedure calls
 */
const withLogging = t.middleware(async ({ path, type, next }) => {
    const start = Date.now()
    const result = await next()
    const duration = Date.now() - start
    console.log(`${type} ${path} - ${duration}ms`)
    return result
})

// Use it:
export const loggedProcedure = publicProcedure.use(withLogging)
```

**Option C: Context Extension Middleware**
```typescript
/**
 * Organization middleware - adds org context from header
 */
const withOrganization = t.middleware(async ({ ctx, next }) => {
    const orgId = ctx.req.headers.get('x-organization-id')

    if (!orgId) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Organization ID required'
        })
    }

    // Fetch org from database
    const [org] = await ctx.db
        .select()
        .from(schema.organizations)
        .where(eq(schema.organizations.id, orgId))

    if (!org) {
        throw new TRPCError({ code: 'NOT_FOUND' })
    }

    return next({
        ctx: {
            ...ctx,
            organization: org,
        }
    })
})

export const orgProcedure = protectedProcedure.use(withOrganization)
```

### Step 3: Update Context Types (if extending)

If your middleware adds to context, update `shared/api-helpers/src/context.ts`:

```typescript
// Base context type
export type TRPCContext = {
    db: DBType
    auth: AuthService
    req: Request
}

// Extended context after middleware
export type OrgContext = TRPCContext & {
    organization: Organization
}
```

### Step 4: Export the Middleware

Ensure it's exported from `shared/api-helpers/src/index.ts`:

```typescript
export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(/* ... */)
export const adminProcedure = protectedProcedure.use(/* ... */)  // Add
```

### Step 5: Use in Routers

```typescript
// In packages/*/src/router.ts
import { adminProcedure, router } from '@shared/api-helpers'

export const adminFeature = router({
    dangerousAction: adminProcedure.mutation(async ({ ctx }) => {
        // Only admins can call this
    }),
})
```

## Common Middleware Patterns

### Rate Limiting
```typescript
const withRateLimit = t.middleware(async ({ ctx, next }) => {
    const key = `rate:${ctx.session?.user.id || ctx.req.headers.get('x-forwarded-for')}`
    const count = await ctx.redis.incr(key)

    if (count === 1) {
        await ctx.redis.expire(key, 60) // 1 minute window
    }

    if (count > 100) {
        throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: 'Rate limit exceeded'
        })
    }

    return next()
})
```

### Input Sanitization
```typescript
const withSanitization = t.middleware(async ({ rawInput, next }) => {
    // Sanitize string inputs
    if (typeof rawInput === 'object' && rawInput !== null) {
        for (const [key, value] of Object.entries(rawInput)) {
            if (typeof value === 'string') {
                (rawInput as Record<string, unknown>)[key] = sanitize(value)
            }
        }
    }
    return next()
})
```

### Timing/Metrics
```typescript
const withMetrics = t.middleware(async ({ path, type, next }) => {
    const start = performance.now()
    const result = await next()
    const duration = performance.now() - start

    metrics.recordProcedureCall({
        path,
        type,
        duration,
        success: result.ok,
    })

    return result
})
```

## Verification

```bash
pnpm lint
pnpm test
pnpm format
```

## Checklist

- [ ] Middleware type determined (procedure, middleware, context extension)
- [ ] Implementation added to `shared/api-helpers/src/index.ts`
- [ ] Context types updated (if extending context)
- [ ] Exported from index
- [ ] Type check passes: `pnpm lint`
- [ ] Tests pass: `pnpm test`
- [ ] Code formatted: `pnpm format`
