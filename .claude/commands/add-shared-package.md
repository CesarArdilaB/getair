# Create a Shared Package

Create a new package in `shared/` following the `@shared/*` naming convention.

## Package Name: $ARGUMENTS

## Reference: Existing Shared Packages

```
shared/
├── api/            # tRPC router composition (depends on packages/*)
├── api-helpers/    # Base tRPC procedures and middleware
├── auth/           # Authentication logic (Better Auth)
├── components/     # Shared React components (frontend)
├── context/        # Dependency injection context
├── database/       # Drizzle schema and connection
└── lib/            # Utility functions (no dependencies)
```

## Instructions

### Step 1: Determine Package Type

Shared packages fall into categories:

| Type | Examples | Typical Exports | Dependencies |
|------|----------|-----------------|--------------|
| Utility | `lib` | Functions, types | None or minimal |
| Service | `auth`, `database` | Services, configs | External libs |
| Infrastructure | `context`, `api-helpers` | Factories, middleware | Other shared |
| Composition | `api` | Combined routers | packages/* |

### Step 2: Create Directory Structure

```bash
mkdir -p shared/<name>/src
```

### Step 3: Create package.json

**Simple package (no deps):**
```json
{
    "name": "@shared/<name>",
    "private": true,
    "type": "module",
    "exports": {
        ".": "./src/index.ts"
    }
}
```

**Package with multiple exports (client/server separation):**
```json
{
    "name": "@shared/<name>",
    "private": true,
    "type": "module",
    "exports": {
        ".": "./src/index.ts",
        "./client": "./src/client.ts",
        "./server": "./src/server.ts"
    },
    "dependencies": {
        "@shared/lib": "workspace:*"
    }
}
```

**Package with testing export:**
```json
{
    "name": "@shared/<name>",
    "private": true,
    "type": "module",
    "exports": {
        ".": "./src/index.ts",
        "./testing": "./src/testing.ts"
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

### Step 5: Create Source Files

**src/index.ts** - Main exports:
```typescript
// Export types
export type { MyType } from './types'

// Export functions
export { myFunction } from './utils'

// Export classes/services
export { MyService } from './service'
```

### Step 6: Update Root tsconfig.json

Add to references array:
```json
{ "path": "shared/<name>" }
```

### Step 7: Install Dependencies

```bash
pnpm install
```

## Dependency Rules

Follow the dependency flow:
- `shared/` packages can depend on other `shared/` packages
- Cannot depend on `packages/*` (except `shared/api`)
- Cannot depend on `apps/*`
- Avoid circular dependencies

**Dependency hierarchy:**
```
shared/lib          # No deps (base utilities)
    ↓
shared/database     # External deps only (drizzle, pg)
shared/auth         # External deps (better-auth)
    ↓
shared/context      # Depends on auth, database
shared/api-helpers  # Depends on context
    ↓
shared/api          # Depends on api-helpers, packages/*
```

## Export Patterns

**Backend-only package:**
```json
{
    "exports": {
        ".": "./src/index.ts"
    }
}
```

**Frontend-only package:**
```json
{
    "exports": {
        ".": "./src/index.ts"
    }
}
```

**Mixed (client/server):**
```json
{
    "exports": {
        "./client": "./src/client.ts",
        "./server": "./src/server.ts"
    }
}
```

## Verification

```bash
pnpm install
pnpm lint
pnpm format
```

## Checklist

- [ ] Directory created: `shared/<name>/`
- [ ] `package.json` with `@shared/<name>` name
- [ ] `tsconfig.json` extending root config
- [ ] `src/index.ts` with exports
- [ ] Added to root `tsconfig.json` references
- [ ] Dependencies follow hierarchy rules
- [ ] No circular dependencies introduced
- [ ] `pnpm install` successful
- [ ] Type check passes: `pnpm lint`
