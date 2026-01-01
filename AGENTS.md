# AGENTS.md - AI Agent Onboarding Guide

This document provides comprehensive context for AI agents working with the Ignite codebase. It serves as the primary reference for understanding the architecture, patterns, and conventions used throughout this monorepo template.

## Quick Reference

| Resource | Description |
|----------|-------------|
| `CLAUDE.md` | Concise instructions for AI assistants |
| `docs/testing.md` | Detailed testing guidelines |
| `README.md` | Architecture overview |
| `CONTRIBUTING.md` | Development guidelines |

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Deep Dive](#architecture-deep-dive)
3. [Package Structure](#package-structure)
4. [Core Patterns](#core-patterns)
5. [Adding Features](#adding-features)
6. [Database Operations](#database-operations)
7. [Authentication](#authentication)
8. [Frontend Integration](#frontend-integration)
9. [Testing](#testing)
10. [Common Tasks](#common-tasks)
11. [Troubleshooting](#troubleshooting)

---

## Project Overview

Ignite is a **monorepo template** for building full-stack web applications. It provides:

- **Type-safe API**: tRPC 11 for end-to-end type safety
- **Modern React**: React 19 with Vite and TailwindCSS 4
- **Robust Backend**: Hono web framework with Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with email/password and OAuth

### Tech Stack Summary

```
Frontend: React 19 + Vite 7 + TailwindCSS 4 + React Router 7
Backend:  Node.js 22 + Hono 4 + tRPC 11
Database: PostgreSQL + Drizzle ORM
Auth:     Better Auth (email/password, Google OAuth)
Testing:  Node.js built-in test runner
Tooling:  pnpm + TypeScript 5.9 + Biome
```

---

## Architecture Deep Dive

### Dependency Flow

Dependencies flow **unidirectionally** - no circular dependencies allowed:

```
┌─────────────────────────────────────────────────────────────┐
│                        apps/                                │
│  ┌─────────────┐              ┌─────────────┐               │
│  │  apps/web   │              │ apps/server │               │
│  │  (React)    │              │   (Hono)    │               │
│  └──────┬──────┘              └──────┬──────┘               │
└─────────┼────────────────────────────┼──────────────────────┘
          │                            │
          ▼                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      packages/                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  @packages/posts (and other feature packages)      │     │
│  └────────────────────────┬───────────────────────────┘     │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       shared/                               │
│  ┌─────────┐ ┌──────────────┐ ┌─────────────┐ ┌─────────┐   │
│  │   api   │ │ api-helpers  │ │   context   │ │   auth  │   │
│  └────┬────┘ └──────┬───────┘ └──────┬──────┘ └────┬────┘   │
│       │             │                │             │        │
│       │             └────────────────┼─────────────┘        │
│       │                              │                      │
│       ▼                              ▼                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    database                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Key Principle: No Global State

**Global variables, singletons, and shared mutable state are prohibited.** All dependencies are passed through the `Context` object:

```typescript
// Context type definition (shared/context/src/index.ts)
export type Context = {
    auth: AuthService    // Authentication service
    db: DBType          // Drizzle ORM instance
    settings: Settings  // Application settings
    close: () => Promise<void>  // Cleanup function
}
```

This pattern enables:
- Easy testing with mock dependencies
- Clear dependency tracking
- No hidden state mutations
- Predictable behavior

---

## Package Structure

### Directory Layout

```
ignite/
├── apps/
│   ├── web/                    # React frontend
│   │   ├── src/
│   │   │   ├── app.tsx         # Root component
│   │   │   ├── main.tsx        # Entry point
│   │   │   ├── auth/           # Auth screens & hooks
│   │   │   ├── components/     # React components
│   │   │   │   └── ui/         # Radix-based UI components
│   │   │   ├── layouts/        # Layout components
│   │   │   ├── routers/        # React Router setup
│   │   │   ├── screens/        # Page components
│   │   │   └── hooks/          # Custom hooks
│   │   └── vite.config.ts
│   │
│   └── server/                 # Node.js backend
│       ├── src/
│       │   ├── main.ts         # Entry point
│       │   ├── server.ts       # Hono app setup
│       │   └── tests/          # Integration tests
│       └── package.json
│
├── shared/                     # Cross-cutting packages
│   ├── api/                    # tRPC router & client
│   │   ├── src/server/         # Server-side exports
│   │   │   ├── root.ts         # Main router composition
│   │   │   └── handler.ts      # Request handler
│   │   └── src/client/         # Client-side exports
│   │       └── index.tsx       # React provider & hooks
│   │
│   ├── api-helpers/            # tRPC utilities
│   │   └── src/
│   │       ├── index.ts        # router, publicProcedure, protectedProcedure
│   │       └── context.ts      # TRPCContext type
│   │
│   ├── context/                # Dependency injection
│   │   └── src/
│   │       ├── index.ts        # createContext()
│   │       └── testing.ts      # createTestContext()
│   │
│   ├── database/               # Database layer
│   │   └── src/
│   │       ├── index.ts        # createDrizzle(), createDatabaseClient()
│   │       ├── utils.ts        # createId() helper
│   │       └── schema/         # Drizzle schemas
│   │           ├── index.ts    # Main schema exports
│   │           └── auth.ts     # Better Auth tables
│   │
│   ├── auth/                   # Authentication
│   │   └── src/
│   │       ├── models/         # Type definitions
│   │       ├── services/       # Auth service factory
│   │       └── react/          # React auth client
│   │
│   ├── components/             # Shared UI components
│   └── lib/                    # Shared utilities
│
└── packages/                   # Feature packages
    └── posts/                  # Example feature
        └── src/
            ├── router.ts       # tRPC router
            ├── index.ts        # Exports
            └── tests/
                └── router.test.ts
```

### Package Naming Convention

| Pattern | Example | Description |
|---------|---------|-------------|
| `@apps/<name>` | `@apps/web`, `@apps/server` | Application entry points |
| `@shared/<name>` | `@shared/api`, `@shared/database` | Cross-cutting shared code |
| `@packages/<name>` | `@packages/posts` | Feature-specific business logic |

### Export Patterns

Packages use explicit exports to separate frontend and backend code:

```json
// Backend-only package
{
    "exports": {
        ".": "./src/index.ts"
    }
}

// Separate client/server exports
{
    "exports": {
        "./server": "./src/server/index.ts",
        "./client": "./src/client/index.tsx"
    }
}

// Multiple named exports
{
    "exports": {
        "./models": "./src/models/index.ts",
        "./services": "./src/services/index.ts",
        "./services/testing": "./src/services/testing.ts",
        "./react": "./src/react/index.ts"
    }
}
```

**Important**: Never mix frontend and backend code in the root export.

---

## Core Patterns

### tRPC Procedures

Three procedure types are available:

```typescript
import { router, publicProcedure, protectedProcedure } from '@shared/api-helpers'

// 1. Public - No authentication required
publicProcedure.query(async ({ ctx }) => {
    // ctx.db, ctx.auth, ctx.settings available
    // ctx.session NOT available
})

// 2. Protected - Requires authenticated session
protectedProcedure.mutation(async ({ ctx }) => {
    // ctx.db, ctx.auth, ctx.settings available
    // ctx.session AVAILABLE (user is authenticated)
    const userId = ctx.session.user.id
})
```

### tRPC Context

The context provides access to all dependencies:

```typescript
type TRPCContext = {
    req: Request        // Raw HTTP request
    db: DBType         // Drizzle ORM instance
    auth: AuthService  // Better Auth service
    settings: Settings // Application configuration
    session?: Session  // Only in protectedProcedure
}
```

### Input/Output Validation

Always validate inputs and outputs with Zod:

```typescript
import z from 'zod'

export const myRouter = router({
    create: protectedProcedure
        .input(z.object({
            title: z.string().min(1, 'Title is required'),
            content: z.string().min(1, 'Content is required'),
        }))
        .output(z.object({
            id: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            // input is typed and validated
            const [result] = await ctx.db
                .insert(schema.items)
                .values({
                    title: input.title,
                    content: input.content,
                    authorId: ctx.session.user.id,
                })
                .returning({ id: schema.items.id })

            return result!
        }),
})
```

### Standard CRUD Naming

Use consistent naming for operations:

| Operation | Procedure Name | Type |
|-----------|---------------|------|
| Create | `create` | mutation |
| Read (single) | `getById` | query |
| Read (list) | `list` | query |
| Update | `update` | mutation |
| Delete | `delete` | mutation |

### Error Handling

Use tRPC errors for consistent error responses:

```typescript
import { TRPCError } from '@trpc/server'

// Common error codes
throw new TRPCError({ code: 'UNAUTHORIZED' })
throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' })
throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid input' })
throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
```

---

## Adding Features

### Step-by-Step Guide

#### 1. Create the Package Directory

```bash
mkdir -p packages/my-feature/src/tests
```

#### 2. Create package.json

```json
{
    "name": "@packages/my-feature",
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
        "@shared/database": "workspace:*"
    },
    "devDependencies": {
        "@shared/context": "workspace:*",
        "tsx": "^4.20.5"
    },
    "peerDependencies": {
        "drizzle-orm": "^0.44.0",
        "zod": "^3.25.20"
    }
}
```

#### 3. Create the Router

```typescript
// packages/my-feature/src/router.ts
import { protectedProcedure, router } from '@shared/api-helpers'
import { schema } from '@shared/database'
import z from 'zod'

export const myFeature = router({
    list: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.select().from(schema.myTable)
    }),

    create: protectedProcedure
        .input(z.object({
            name: z.string().min(1),
        }))
        .mutation(async ({ ctx, input }) => {
            const [item] = await ctx.db
                .insert(schema.myTable)
                .values({
                    name: input.name,
                    createdBy: ctx.session.user.id,
                })
                .returning()

            return item!
        }),
})
```

#### 4. Create Index Export

```typescript
// packages/my-feature/src/index.ts
export { myFeature } from './router'
```

#### 5. Register in API Router

```typescript
// shared/api/src/server/root.ts
import { posts } from '@packages/posts'
import { myFeature } from '@packages/my-feature'
import { router } from '@shared/api-helpers'

export const appRouter = router({
    posts,
    myFeature,  // Add here
})
```

#### 6. Add tsconfig.json

```json
{
    "extends": "../../tsconfig.json",
    "compilerOptions": {
        "outDir": "dist",
        "rootDir": "src"
    },
    "include": ["src"]
}
```

#### 7. Update Root tsconfig.json

Add the reference to the root `tsconfig.json`:

```json
{
    "references": [
        // ... existing references
        { "path": "packages/my-feature" }
    ]
}
```

#### 8. Create Tests

```typescript
// packages/my-feature/src/tests/router.test.ts
import assert from 'node:assert/strict'
import test, { after, describe } from 'node:test'
import { createTestContext } from '@shared/context/testing'
import { myFeature } from '../router'

const context = await createTestContext()

describe('myFeature router', () => {
    test('create item', async () => {
        const caller = myFeature.createCaller({
            db: context.db,
            session: {
                session: { id: 'S0001', userId: 'U0001', createdAt: new Date(), updatedAt: new Date() },
                user: { id: 'U0001', email: 'test@example.com', name: 'Test User' },
            },
        })

        const result = await caller.create({ name: 'Test Item' })
        assert.ok(result.id)
    })
})

after(async () => {
    await context.close()
})
```

#### 9. Install Dependencies

```bash
pnpm install
```

#### 10. Run Tests

```bash
pnpm --filter @packages/my-feature test
```

---

## Database Operations

### Schema Definition

Define schemas in `shared/database/src/schema/`:

```typescript
// shared/database/src/schema/my-table.ts
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '../utils'

export const myTable = pgTable('my_table', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => createId()),
    name: text('name').notNull(),
    description: text('description'),
    createdBy: text('created_by').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
})
```

Export from the schema index:

```typescript
// shared/database/src/schema/index.ts
export * from './auth'
export * from './my-table'  // Add this line
```

### ID Generation

Use the `createId()` helper for generating unique IDs:

```typescript
import { createId } from '../utils'

// Generates a 10-character alphanumeric ID
const id = createId()  // e.g., "a1b2c3d4e5"
```

### Common Queries

```typescript
import { eq, and, desc, like } from 'drizzle-orm'
import { schema } from '@shared/database'

// Select all
const items = await ctx.db.select().from(schema.myTable)

// Select with condition
const item = await ctx.db
    .select()
    .from(schema.myTable)
    .where(eq(schema.myTable.id, id))
    .limit(1)

// Select with multiple conditions
const items = await ctx.db
    .select()
    .from(schema.myTable)
    .where(and(
        eq(schema.myTable.createdBy, userId),
        like(schema.myTable.name, `%${search}%`)
    ))
    .orderBy(desc(schema.myTable.createdAt))

// Insert
const [newItem] = await ctx.db
    .insert(schema.myTable)
    .values({ name: 'New Item', createdBy: userId })
    .returning()

// Update
await ctx.db
    .update(schema.myTable)
    .set({ name: 'Updated Name' })
    .where(eq(schema.myTable.id, id))

// Delete
await ctx.db
    .delete(schema.myTable)
    .where(eq(schema.myTable.id, id))
```

### Applying Schema Changes

After modifying schemas, push changes to the database:

```bash
pnpm db:push
```

---

## Authentication

### Session Access

In protected procedures, access the session:

```typescript
protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id
    const userEmail = ctx.session.user.email
    const userName = ctx.session.user.name
})
```

### Session Type

```typescript
type Session = {
    session: {
        id: string
        userId: string
        createdAt: Date
        updatedAt: Date
    }
    user: {
        id: string
        email: string
        name: string
    }
}
```

### Auth Service

The auth service provides:

```typescript
type AuthService = {
    handler: (req: Request) => Promise<Response>  // Auth endpoints
    getSession: (headers: Headers) => Promise<Session | null>  // Session lookup
}
```

---

## Frontend Integration

### API Client Usage

```typescript
import { useTRPC } from '@shared/api/client'

function MyComponent() {
    const trpc = useTRPC()

    // Query
    const { data, isLoading, error } = trpc.posts.list.useQuery()

    // Mutation
    const createPost = trpc.posts.create.useMutation()

    const handleCreate = async () => {
        await createPost.mutateAsync({
            title: 'New Post',
            content: 'Content here',
        })
    }

    return (/* ... */)
}
```

### App Structure

```typescript
// apps/web/src/app.tsx
import { ApiProvider } from '@shared/api/client'
import { RouterProvider } from 'react-router'

export function App() {
    return (
        <ApiProvider>
            <RouterProvider router={router} />
        </ApiProvider>
    )
}
```

---

## Testing

### Test Framework

- **Runner**: Node.js built-in `node:test`
- **Assertions**: `node:assert/strict`
- **Execution**: `tsx --test`

### Test Context

```typescript
import { createTestContext } from '@shared/context/testing'

const context = await createTestContext()

// Provides:
// - context.db: Drizzle ORM instance
// - context.auth: Mock auth service
// - context.settings: Test settings
// - context.close(): Cleanup function

// Test user available:
// ID: U0001, Email: johndoe@example.com, Name: John Doe
```

### Test Types

#### Unit Tests (Router)

```typescript
import { createTestContext } from '@shared/context/testing'
import { posts } from '../router'

const context = await createTestContext()

test('create post', async () => {
    const caller = posts.createCaller({
        db: context.db,
        session: {
            session: { id: 'S0001', userId: 'U0001', createdAt: new Date(), updatedAt: new Date() },
            user: { id: 'U0001', email: 'test@example.com', name: 'Test User' },
        },
    })

    const result = await caller.create({ title: 'Test', content: 'Content' })
    assert.ok(result.id)
})
```

#### Integration Tests (API)

```typescript
import { createApiClient } from '@shared/api/client'
import { createTestContext } from '@shared/context/testing'
import { startServer } from '../server'

const context = await createTestContext()
const controller = new AbortController()

before(async () => {
    await startServer({
        signal: controller.signal,
        port: 3013,
        hostname: 'localhost',
        context,
    })
})

test('create post via API', async () => {
    const api = createApiClient('http://localhost:3013')
    const result = await api.posts.create.mutate({
        title: 'Test',
        content: 'Content',
    })
    assert.ok(result.id)
})

after(async () => {
    controller.abort()
    await context.close()
})
```

### Running Tests

```bash
# All tests
pnpm test

# Specific package
pnpm --filter @packages/posts test
pnpm --filter @apps/server test

# With coverage (server only)
pnpm --filter @apps/server test
```

---

## Common Tasks

### Adding a New Database Table

1. Create schema in `shared/database/src/schema/`
2. Export from `shared/database/src/schema/index.ts`
3. Run `pnpm db:push`

### Adding a New API Endpoint

1. Add procedure to existing router or create new router
2. If new router, register in `shared/api/src/server/root.ts`
3. Add tests

### Adding a New Shared Utility

1. Add to `shared/lib/src/index.ts`
2. Export and use in other packages

### Formatting Code

```bash
pnpm format
```

### Type Checking

```bash
pnpm lint
```

### Starting Development

```bash
pnpm dev
```

---

## Troubleshooting

### Circular Dependencies

**Symptom**: Import errors or undefined exports

**Solution**: Check dependency graph - dependencies must flow downward (apps → packages → shared)

### Missing tsconfig Reference

**Symptom**: Type errors in new package

**Solution**: Add reference to root `tsconfig.json`

### Floating Promises

**Symptom**: Biome error `noFloatingPromises`

**Solution**: Always `await` promises or explicitly handle them

### Database Connection Issues

**Symptom**: Connection refused errors

**Solution**: Ensure PostgreSQL is running and `DATABASE_URL` is set in `.env`

### Port Already in Use

**Symptom**: EADDRINUSE error

**Solution**: Use unique ports for each test file (e.g., 3011, 3012, 3013)

---

## Code Style

### Biome Configuration

- **Indentation**: 4 spaces
- **Quotes**: Single quotes
- **Semicolons**: Only when necessary (ASI)
- **Imports**: Auto-organized

### Commit Messages

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Example: feat(posts): add create post endpoint
```

---

## Important Files Reference

| File | Purpose |
|------|---------|
| `shared/api/src/server/root.ts` | Main tRPC router |
| `shared/api-helpers/src/index.ts` | Base procedures |
| `shared/context/src/index.ts` | Context factory |
| `shared/context/src/testing.ts` | Test context |
| `shared/database/src/schema/` | Database schemas |
| `apps/server/src/server.ts` | Hono server |
| `apps/web/src/app.tsx` | React app root |
| `biome.json` | Code formatting |
| `tsconfig.json` | TypeScript config |

---

## Environment Variables

```env
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/ignite

# Required for client
CLIENT_URL=http://localhost:5173

# Optional (OAuth)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```
