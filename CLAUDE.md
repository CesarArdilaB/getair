# CLAUDE.md

This document provides guidance for AI assistants working with the Ignite codebase.

## Additional Resources

| Document | Purpose |
|----------|---------|
| `AGENTS.md` | Comprehensive AI agent onboarding guide with deep architecture details |
| `docs/testing.md` | Detailed testing guidelines and patterns |
| `README.md` | Project architecture overview |
| `CONTRIBUTING.md` | Development guidelines |
| `.claude/agents.json` | Agent configuration and workflows |

## Specialized Agents

Specialized agents are available in `.claude/agents/` for complex tasks:

| Agent | Trigger | Purpose |
|-------|---------|---------|
| `feature-generator` | "create feature", "new module" | Creates complete feature packages |
| `schema-builder` | "add table", "create schema" | Creates Drizzle ORM schemas |
| `test-runner` | "run tests", "fix tests" | Runs and fixes tests |
| `e2e-tester` | "e2e test", "integration test" | Creates E2E tests |
| `api-reviewer` | "review api", "check router" | Reviews tRPC implementations |
| `dependency-checker` | "check deps", "circular" | Validates architecture |
| `frontend-component` | "create component", "new screen" | Creates React components |
| `auth-helper` | "auth", "login", "protected" | Implements auth features |
| `code-quality` | "format", "lint" | Fixes code quality issues |
| `documentation-sync` | "update docs", "sync docs" | Keeps docs in sync |

## Slash Commands

Use these commands to quickly scaffold common tasks:

| Command | Description |
|---------|-------------|
| `/new-feature <name>` | Create a complete feature package with router, tests, and config |
| `/new-package <name>` | Create a new package following `@packages/posts` reference implementation |
| `/add-schema <name>` | Add a new database table schema |
| `/add-router <name>` | Add a tRPC router to an existing or new package |
| `/add-procedure <router> <name>` | Add a procedure to an existing router (e.g., `posts getById`) |
| `/add-shared-package <name>` | Create a package in `shared/` with proper exports |
| `/add-migration [description]` | Generate and apply a Drizzle database migration |
| `/add-middleware <name>` | Create tRPC middleware or custom procedure |
| `/add-component <name>` | Add shadcn/ui or custom component to @shared/components |
| `/debug-imports [file]` | Analyze and fix circular dependencies and import issues |
| `/setup-env [fresh\|reset]` | Initialize or reset development environment |
| `/review-pr [number\|branch]` | Review changes against architecture rules |
| `/run-tests [scope]` | Run tests and get guidance on fixing failures |
| `/run-e2e [pattern]` | Run Playwright E2E tests with optional file/pattern filter |
| `/new-mobile-screen <name>` | Create a new screen for the React Native mobile app |

## Project Overview

Ignite is a monorepo template for building web and mobile applications with React frontend, React Native mobile app, and Node.js backend. It uses tRPC for type-safe API communication, Drizzle ORM for database access, and follows a modular architecture with dependency injection.

## Tech Stack

- **Runtime**: Node.js v22.x
- **Package Manager**: pnpm with workspaces
- **Web**: React 19, Vite, TailwindCSS 4, React Router 7
- **Mobile**: React Native, Expo SDK 52, Expo Router, NativeWind
- **Backend**: Hono, tRPC 11
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Better Auth (with Expo support)
- **Linting/Formatting**: Biome

## Repository Structure

```
ignite/
├── apps/
│   ├── web/          # React frontend (Vite) - customer-facing
│   ├── cms/          # CMS admin panel (Vite) - content management
│   ├── mobile/       # React Native app (Expo) - customer-facing
│   └── server/       # Node.js backend (Hono + tRPC)
├── shared/           # Cross-cutting shared code
│   ├── api/          # tRPC router composition
│   ├── api-helpers/  # Base tRPC procedures and middleware
│   ├── auth/         # Authentication logic (web + expo)
│   ├── components/   # Shared React components (web only)
│   ├── context/      # Dependency injection context
│   ├── database/     # Drizzle schema and connection
│   └── lib/          # Utility functions
├── packages/         # Business logic features
│   ├── cms/          # CMS access control and admin procedures
│   └── posts/        # Example feature package
├── biome.json        # Linting/formatting config
├── tsconfig.json     # TypeScript project references
└── pnpm-workspace.yaml
```

## Common Commands

```bash
# Development
pnpm dev              # Start web + server concurrently

# CMS Development (in apps/cms)
pnpm dev              # Start CMS on port 5174

# Mobile Development (in apps/mobile)
pnpm dev              # Start Expo development server
pnpm ios              # Run on iOS simulator
pnpm android          # Run on Android emulator

# Database
pnpm db:push          # Push schema changes to database

# Testing
pnpm test             # Run all tests

# E2E Testing (in apps/web)
pnpm test:e2e         # Run Playwright E2E tests
pnpm test:e2e:ui      # Open Playwright UI mode
pnpm test:e2e:debug   # Run tests in debug mode

# Mobile Builds (in apps/mobile)
pnpm build:dev        # Build development client
pnpm build:preview    # Build preview for testing
pnpm build:production # Build production release

# Code Quality
pnpm format           # Format code with Biome
pnpm lint             # Type-check with TypeScript
```

## Package Naming Convention

- `@shared/<name>` - Shared packages
- `@apps/<name>` - Applications
- `@packages/<name>` - Business logic packages

All packages must be added to `tsconfig.json` references.

## Key Architecture Principles

### No Global State

Global variables, singletons, and shared mutable state are not allowed. All dependencies (database, auth, external services) are passed through the `Context` object:

```typescript
// Context is created once at server start and passed through
export type Context = {
    auth: AuthService
    db: DBType
    settings: Settings
    close: () => Promise<void>
}
```

### Dependency Flow

Dependencies flow unidirectionally - no circular dependencies allowed:

- `apps/` depends on `shared/` and `packages/`
- `packages/` depends on `shared/`
- `shared/` packages can depend on other `shared/` packages (following DAG)

### Export Rules

- Backend and frontend code must be exported separately using `package.json` exports
- Use named exports: `./client`, `./server`, `./services`, or `./routers`
- Don't mix frontend and backend code in root exports

## Adding a New Feature

1. **Create package** in `packages/`:
```bash
mkdir -p packages/my-feature/src
```

2. **Create package.json**:
```json
{
    "name": "@packages/my-feature",
    "private": true,
    "type": "module",
    "exports": {
        ".": "./src/index.ts"
    },
    "dependencies": {
        "@shared/api-helpers": "workspace:*",
        "@shared/database": "workspace:*"
    }
}
```

3. **Create tRPC router** (`packages/my-feature/src/router.ts`):
```typescript
import { protectedProcedure, router } from '@shared/api-helpers'
import { schema } from '@shared/database'
import z from 'zod'

export const myFeature = router({
    list: protectedProcedure.query(async ({ ctx }) => {
        // Use ctx.db for database access
    }),
    create: protectedProcedure
        .input(z.object({ name: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            // ctx.session.user available in protected procedures
        }),
})
```

4. **Export from index** (`packages/my-feature/src/index.ts`):
```typescript
export { myFeature } from './router'
```

5. **Register in API** (`shared/api/src/server/root.ts`):
```typescript
import { myFeature } from '@packages/my-feature'

export const appRouter = router({
    posts,
    myFeature,  // Add here
})
```

6. **Add to tsconfig.json** references:
```json
{
    "references": [
        { "path": "packages/my-feature" }
    ]
}
```

## tRPC Procedure Naming

Use consistent naming for CRUD operations:
- `create` - Create new resource
- `getById` - Get single resource by ID
- `list` - Get multiple resources
- `update` - Update existing resource
- `delete` - Delete resource

## Database Schema

Schemas are defined in `shared/database/src/schema/` using Drizzle ORM:

```typescript
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '../utils'

export const myTable = pgTable('my_table', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
})
```

Run `pnpm db:push` to apply schema changes.

## Testing

Tests use Node.js built-in test runner with test context injection:

```typescript
import test, { after, before } from 'node:test'
import { createTestContext } from '@shared/context/testing'
import { startServer } from '../server'

const context = await createTestContext()
const controller = new AbortController()

before(async () => {
    await startServer({ signal: controller.signal, port: 3013, context })
})

test('my test', async () => {
    // Test implementation
})

after(async () => {
    controller.abort()
    await context.close()
})
```

## Code Style (Biome)

- **Indentation**: 4 spaces
- **Quotes**: Single quotes
- **Semicolons**: Only when necessary (ASI)
- **Imports**: Auto-organized

Run `pnpm format` before committing.

## Environment Variables

Create `.env` in project root (copied from `apps/server/.env.example`):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ignition
CLIENT_URL=http://localhost:5173
```

## Important Files

| File | Purpose |
|------|---------|
| `shared/api/src/server/root.ts` | Main tRPC router composition |
| `shared/api-helpers/src/index.ts` | Base procedures (publicProcedure, protectedProcedure, adminProcedure) |
| `shared/context/src/index.ts` | Context factory with all dependencies |
| `shared/database/src/schema/` | Database schema definitions |
| `shared/database/src/schema/rbac.ts` | Role-based access control schema |
| `shared/auth/src/expo/index.ts` | Expo auth client with SecureStore |
| `apps/server/src/server.ts` | Hono server setup with tRPC handler |
| `apps/cms/src/` | CMS admin panel (separate app on port 5174) |
| `apps/mobile/app/_layout.tsx` | Mobile app root layout with providers |
| `apps/mobile/src/providers/` | Mobile-specific providers (auth, api) |
| `packages/cms/src/router.ts` | CMS tRPC router for access checks |

## CMS Application

The CMS is a **separate application** at `apps/cms/` that runs on port 5174. It provides content management for both web and mobile apps.

### Running the CMS

```bash
cd apps/cms
pnpm dev    # Starts on http://localhost:5174
```

### Admin Roles

| Role | Access Level |
|------|-------------|
| `super_admin` | Full access to all features |
| `editor` | Content management (pages, articles, products) |
| `content_manager` | Limited content editing (articles only) |
| `customer` | Regular user (no CMS access) |

### Using Admin Procedures

```typescript
import { adminProcedure, createPermissionProcedure } from '@shared/api-helpers'

// Requires any admin role
export const myAdminRouter = router({
    list: adminProcedure.query(async ({ ctx }) => {
        // ctx.userRoles contains user's role names
    }),
})

// Requires specific permission
const canPublish = createPermissionProcedure('cms.pages.publish')
export const publishPage = canPublish.mutation(async ({ ctx, input }) => {
    // Only users with cms.pages.publish permission
})
```

### CMS Components

The CMS uses its own layout components in `apps/cms/src/`:

```typescript
// apps/cms/src/components/cms-barrier.tsx - Protects routes
// apps/cms/src/layouts/cms-layout.tsx - Main layout wrapper
// apps/cms/src/layouts/cms-sidebar.tsx - Navigation sidebar
```

## Common Pitfalls

1. **Circular dependencies**: Always check import paths don't create cycles
2. **Missing tsconfig reference**: New packages need to be added to root `tsconfig.json`
3. **Mixing client/server exports**: Keep frontend and backend code in separate export paths
4. **Global state**: Use context injection instead of global variables
5. **Floating promises**: Biome enforces `noFloatingPromises` - always await or handle promises

## Commit Message Format

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Example: feat(posts): add create post endpoint
```

## AI Agent Rules

### Testing Requirements

**IMPORTANT**: AI agents MUST follow these testing rules after making any code changes:

1. **Always write tests** for new features, bug fixes, and refactors
2. **Run `pnpm test`** after making changes to ensure all tests pass
3. **Fix any failing tests** before considering the task complete
4. **Add appropriate test coverage**:
   - Unit tests for business logic and utilities
   - Integration tests for API endpoints
5. **Never commit code with failing tests**

See `docs/testing.md` for detailed testing guidelines.
