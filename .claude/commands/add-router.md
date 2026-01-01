# Add tRPC Router

Add a new tRPC router to an existing package or the shared API layer in the Ignite monorepo.

## Router Details: $ARGUMENTS

Expected format: `<package-name>/<router-name>` or just `<router-name>` for a new package

## Instructions

### 1. Determine Router Location

**Option A: Add to existing package**
- If the router belongs to an existing feature package, add it there
- Location: `packages/<package-name>/src/router.ts` (extend existing) or create new file

**Option B: Create new package**
- If this is a new feature, use `/new-feature` command instead
- Or follow the package creation steps below

### 2. Router Structure

Create a router following this template:

```typescript
// packages/<package>/src/router.ts
import { protectedProcedure, publicProcedure, router } from '@shared/api-helpers'
import { schema } from '@shared/database'
import { TRPCError } from '@trpc/server'
import { eq } from 'drizzle-orm'
import z from 'zod'

export const <routerName> = router({
    // List all items
    list: protectedProcedure
        .query(async ({ ctx }) => {
            return ctx.db.select().from(schema.<tableName>)
        }),

    // Get single item by ID
    getById: protectedProcedure
        .input(z.object({
            id: z.string().min(1, 'ID is required'),
        }))
        .query(async ({ ctx, input }) => {
            const [item] = await ctx.db
                .select()
                .from(schema.<tableName>)
                .where(eq(schema.<tableName>.id, input.id))
                .limit(1)

            if (!item) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Item not found',
                })
            }

            return item
        }),

    // Create new item
    create: protectedProcedure
        .input(z.object({
            // Define input fields with validation
            name: z.string().min(1, 'Name is required'),
            description: z.string().optional(),
        }))
        .output(z.object({
            id: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const [item] = await ctx.db
                .insert(schema.<tableName>)
                .values({
                    ...input,
                    createdBy: ctx.session.user.id,
                })
                .returning({ id: schema.<tableName>.id })

            return item!
        }),

    // Update existing item
    update: protectedProcedure
        .input(z.object({
            id: z.string().min(1, 'ID is required'),
            name: z.string().min(1).optional(),
            description: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input

            const [item] = await ctx.db
                .update(schema.<tableName>)
                .set(data)
                .where(eq(schema.<tableName>.id, id))
                .returning()

            if (!item) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Item not found',
                })
            }

            return item
        }),

    // Delete item
    delete: protectedProcedure
        .input(z.object({
            id: z.string().min(1, 'ID is required'),
        }))
        .mutation(async ({ ctx, input }) => {
            const [deleted] = await ctx.db
                .delete(schema.<tableName>)
                .where(eq(schema.<tableName>.id, input.id))
                .returning({ id: schema.<tableName>.id })

            if (!deleted) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Item not found',
                })
            }

            return { success: true }
        }),
})
```

### 3. Export Router

In `packages/<package>/src/index.ts`:

```typescript
export { <routerName> } from './router'
```

### 4. Register in App Router

Update `shared/api/src/server/root.ts`:

```typescript
import { <routerName> } from '@packages/<package-name>'

export const appRouter = router({
    // ... existing routers
    <routerName>,
})
```

Update `shared/api/package.json` dependencies:

```json
{
    "dependencies": {
        "@packages/<package-name>": "workspace:*"
    }
}
```

### 5. Create Tests

Create `packages/<package>/src/tests/router.test.ts`:

```typescript
import assert from 'node:assert/strict'
import test, { after, describe } from 'node:test'
import { createTestContext } from '@shared/context/testing'
import { <routerName> } from '../router'

const context = await createTestContext()

// Mock session for testing
const mockSession = {
    session: {
        id: 'S0001',
        userId: 'U0001',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    user: {
        id: 'U0001',
        email: 'test@example.com',
        name: 'Test User',
    },
}

describe('<routerName> router', () => {
    test('create item', async () => {
        const caller = <routerName>.createCaller({
            db: context.db,
            session: mockSession,
        })

        const result = await caller.create({
            name: 'Test Item',
            description: 'Test description',
        })

        assert.ok(result.id, 'Should return item ID')
    })

    test('list items', async () => {
        const caller = <routerName>.createCaller({
            db: context.db,
            session: mockSession,
        })

        const items = await caller.list()

        assert.ok(Array.isArray(items), 'Should return array')
    })

    test('get item by id', async () => {
        const caller = <routerName>.createCaller({
            db: context.db,
            session: mockSession,
        })

        // First create an item
        const created = await caller.create({ name: 'Get Test' })

        // Then retrieve it
        const item = await caller.getById({ id: created.id })

        assert.equal(item.name, 'Get Test')
    })

    test('update item', async () => {
        const caller = <routerName>.createCaller({
            db: context.db,
            session: mockSession,
        })

        const created = await caller.create({ name: 'Original' })
        const updated = await caller.update({
            id: created.id,
            name: 'Updated',
        })

        assert.equal(updated.name, 'Updated')
    })

    test('delete item', async () => {
        const caller = <routerName>.createCaller({
            db: context.db,
            session: mockSession,
        })

        const created = await caller.create({ name: 'To Delete' })
        const result = await caller.delete({ id: created.id })

        assert.equal(result.success, true)
    })

    test('fails with empty name', async () => {
        const caller = <routerName>.createCaller({
            db: context.db,
            session: mockSession,
        })

        await assert.rejects(
            async () => caller.create({ name: '' }),
            /Name is required/,
        )
    })

    test('getById fails for non-existent item', async () => {
        const caller = <routerName>.createCaller({
            db: context.db,
            session: mockSession,
        })

        await assert.rejects(
            async () => caller.getById({ id: 'non-existent-id' }),
            /NOT_FOUND/,
        )
    })
})

after(async () => {
    await context.close()
})
```

### 6. Run Tests

```bash
pnpm install  # If new package
pnpm --filter @packages/<package-name> test
pnpm test  # Run all tests
```

## Procedure Types

### publicProcedure (No Auth)

```typescript
list: publicProcedure.query(async ({ ctx }) => {
    // ctx.session is NOT available
    return ctx.db.select().from(schema.publicItems)
})
```

### protectedProcedure (Auth Required)

```typescript
create: protectedProcedure.mutation(async ({ ctx }) => {
    // ctx.session IS available
    const userId = ctx.session.user.id
})
```

## Input Validation Examples

```typescript
// String validation
z.string().min(1, 'Required').max(100, 'Too long')

// Email
z.string().email('Invalid email')

// Number
z.number().int().positive()

// Optional
z.string().optional()

// Nullable
z.string().nullable()

// Enum
z.enum(['draft', 'published', 'archived'])

// Array
z.array(z.string()).min(1, 'At least one required')

// Nested object
z.object({
    address: z.object({
        street: z.string(),
        city: z.string(),
    }),
})

// Union
z.union([z.string(), z.number()])

// Refinement
z.string().refine(val => val.startsWith('https://'), 'Must be HTTPS URL')
```

## Checklist

- [ ] Router created with appropriate procedures
- [ ] Input validation with Zod
- [ ] Proper error handling with TRPCError
- [ ] Exported from package index
- [ ] Registered in appRouter
- [ ] Package dependency added to @shared/api
- [ ] Tests cover all procedures
- [ ] Tests cover error cases
- [ ] All tests passing
- [ ] Code formatted with `pnpm format`
