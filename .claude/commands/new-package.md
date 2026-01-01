# Create a New Package

Create a complete feature package in `packages/` following the `@packages/posts` reference implementation.

## Package Name: $ARGUMENTS

## Quick Reference: @packages/posts Structure

```
packages/posts/
├── src/
│   ├── index.ts           # Re-exports router
│   ├── router.ts          # tRPC router with list/create procedures
│   └── tests/
│       └── router.test.ts # Unit tests using createTestContext
├── package.json           # @packages/posts with workspace deps
└── tsconfig.json          # Extends root tsconfig
```

## Instructions

### Step 1: Parse Package Name

Convert the input to proper formats:
- **Directory**: lowercase, kebab-case (e.g., `user-profiles`)
- **Package name**: `@packages/<directory-name>`
- **Router name**: camelCase (e.g., `userProfiles`)
- **Schema table**: snake_case (e.g., `user_profiles`)

### Step 2: Create Directory Structure

```bash
mkdir -p packages/<name>/src/tests
```

### Step 3: Create package.json

```json
{
    "name": "@packages/<name>",
    "private": true,
    "type": "module",
    "exports": {
        ".": "./src/index.ts"
    },
    "scripts": {
        "test": "tsx --test src/tests/**/*.test.ts"
    },
    "dependencies": {
        "@shared/api-helpers": "workspace:*",
        "@shared/context": "workspace:*",
        "@shared/database": "workspace:*"
    },
    "devDependencies": {
        "tsx": "^4.20.5"
    },
    "peerDependencies": {
        "drizzle-orm": "0.x",
        "zod": ">=3.0.0"
    }
}
```

### Step 4: Create tsconfig.json

```json
{
    "extends": "../../tsconfig.json",
    "compilerOptions": {
        "rootDir": "src"
    },
    "include": ["src"]
}
```

### Step 5: Create src/router.ts

Follow this pattern from `@packages/posts`:

```typescript
import { protectedProcedure, router } from '@shared/api-helpers'
import { schema } from '@shared/database'
import z from 'zod'

export const <routerName> = router({
    list: protectedProcedure.query(async ({ ctx }) => {
        const items = await ctx.db
            .select({
                id: schema.<tableName>.id,
                // ... select fields
            })
            .from(schema.<tableName>)

        return items
    }),

    create: protectedProcedure
        .input(
            z.object({
                // ... input validation
            }),
        )
        .output(
            z.object({
                id: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const [item] = await ctx.db
                .insert(schema.<tableName>)
                .values({
                    // ... values from input
                    // Use ctx.session.user.id for user association
                })
                .returning({
                    id: schema.<tableName>.id,
                })

            return item!
        }),
})
```

### Step 6: Create src/index.ts

```typescript
export * from './router'
```

### Step 7: Create src/tests/router.test.ts

Follow the test pattern from `@packages/posts`:

```typescript
import assert from 'node:assert/strict'
import test, { after, describe } from 'node:test'
import { createTestContext } from '@shared/context/testing'
import { schema } from '@shared/database'
import { eq } from 'drizzle-orm'
import { <routerName> } from '../router'

const context = await createTestContext()

describe('<RouterName> Router', () => {
    const createdIds: string[] = []

    // Mock session for creating caller
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

    test('list returns empty array when no items exist', async () => {
        await context.db.delete(schema.<tableName>)

        const caller = <routerName>.createCaller({
            db: context.db,
            session: mockSession,
        })

        const result = await caller.list()

        assert.ok(Array.isArray(result), 'Should return an array')
        assert.equal(result.length, 0, 'Should be empty')
    })

    test('create inserts item into database', async () => {
        const caller = <routerName>.createCaller({
            db: context.db,
            session: mockSession,
        })

        const result = await caller.create({
            // ... test input
        })

        assert.ok(result.id, 'Should return item id')
        createdIds.push(result.id)

        // Verify in database
        const [dbItem] = await context.db
            .select()
            .from(schema.<tableName>)
            .where(eq(schema.<tableName>.id, result.id))

        assert.ok(dbItem, 'Item should exist in database')
    })

    after(async () => {
        for (const id of createdIds) {
            await context.db.delete(schema.<tableName>).where(eq(schema.<tableName>.id, id))
        }
        await context.close()
    })
})
```

### Step 8: Create Database Schema (if needed)

Create `shared/database/src/schema/<name>.ts`:

```typescript
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '../utils'

export const <tableName> = pgTable('<table_name>', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    // ... fields
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
})
```

Export from `shared/database/src/schema/index.ts`.

### Step 9: Register Router

Update `shared/api/src/server/root.ts`:

```typescript
import { <routerName> } from '@packages/<name>'

export const appRouter = router({
    // ... existing
    <routerName>,
})
```

Add dependency to `shared/api/package.json`:

```json
{
    "dependencies": {
        "@packages/<name>": "workspace:*"
    }
}
```

### Step 10: Update Root tsconfig.json

Add to references array:

```json
{ "path": "packages/<name>" }
```

### Step 11: Install and Verify

```bash
pnpm install
pnpm --filter @packages/<name> test
pnpm format
pnpm lint
```

## Checklist

After completing all steps, verify:

- [ ] `packages/<name>/` directory exists
- [ ] `package.json` has correct name and dependencies
- [ ] `tsconfig.json` extends root config
- [ ] `src/router.ts` exports router with procedures
- [ ] `src/index.ts` re-exports router
- [ ] `src/tests/router.test.ts` has comprehensive tests
- [ ] Database schema created (if applicable)
- [ ] Router registered in `shared/api/src/server/root.ts`
- [ ] Dependency added to `shared/api/package.json`
- [ ] Reference added to root `tsconfig.json`
- [ ] `pnpm install` successful
- [ ] Tests pass: `pnpm --filter @packages/<name> test`
- [ ] Code formatted: `pnpm format`
- [ ] Type check passes: `pnpm lint`
