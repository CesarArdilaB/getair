# Add a Procedure to an Existing Router

Add a new tRPC procedure to an existing router in the codebase.

## Arguments: $ARGUMENTS

Parse arguments as: `<router-name> <procedure-name>` (e.g., `posts getById` or `comments delete`)

## Instructions

### Step 1: Locate the Router

Find the router file:
```
packages/<router-name>/src/router.ts
```

If not found, check if it's a nested router or suggest using `/new-package` first.

### Step 2: Determine Procedure Type

Based on the procedure name, determine the type:

| Name Pattern | Type | Template |
|--------------|------|----------|
| `list`, `getAll`, `get*` | Query | `protectedProcedure.query()` |
| `getById`, `getOne` | Query with input | `protectedProcedure.input(z.object({ id: z.string() })).query()` |
| `create`, `add` | Mutation | `protectedProcedure.input(...).output(...).mutation()` |
| `update`, `edit` | Mutation | `protectedProcedure.input(z.object({ id: z.string(), ... })).mutation()` |
| `delete`, `remove` | Mutation | `protectedProcedure.input(z.object({ id: z.string() })).mutation()` |

### Step 3: Add the Procedure

Add to the router following existing patterns. Example procedures:

**getById** (Query with ID input):
```typescript
getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
        const [item] = await ctx.db
            .select()
            .from(schema.<table>)
            .where(eq(schema.<table>.id, input.id))

        if (!item) {
            throw new TRPCError({ code: 'NOT_FOUND' })
        }

        return item
    }),
```

**update** (Mutation with ID and data):
```typescript
update: protectedProcedure
    .input(
        z.object({
            id: z.string(),
            // ... fields to update
        }),
    )
    .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input

        const [updated] = await ctx.db
            .update(schema.<table>)
            .set(data)
            .where(eq(schema.<table>.id, id))
            .returning()

        if (!updated) {
            throw new TRPCError({ code: 'NOT_FOUND' })
        }

        return updated
    }),
```

**delete** (Mutation to remove):
```typescript
delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
        const [deleted] = await ctx.db
            .delete(schema.<table>)
            .where(eq(schema.<table>.id, input.id))
            .returning({ id: schema.<table>.id })

        if (!deleted) {
            throw new TRPCError({ code: 'NOT_FOUND' })
        }

        return { success: true }
    }),
```

### Step 4: Add Required Imports

Ensure these imports are present:
```typescript
import { TRPCError } from '@trpc/server'
import { eq } from 'drizzle-orm'  // for queries with WHERE clauses
```

### Step 5: Add Tests

Add test cases to `packages/<router-name>/src/tests/router.test.ts`:

```typescript
test('<procedure-name> works correctly', async () => {
    const caller = <routerName>.createCaller({
        db: context.db,
        session: mockSession,
    })

    // Test the procedure
    const result = await caller.<procedureName>({
        // ... input
    })

    // Assertions
    assert.ok(result, 'Should return result')
})
```

### Step 6: Verify

```bash
pnpm --filter @packages/<router-name> test
pnpm format
pnpm lint
```

## Checklist

- [ ] Router file located
- [ ] Procedure type determined (query/mutation)
- [ ] Procedure added with proper input/output validation
- [ ] Required imports added (TRPCError, eq, etc.)
- [ ] Test case added
- [ ] Tests pass
- [ ] Code formatted
