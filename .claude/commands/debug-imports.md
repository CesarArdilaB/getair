# Debug Import Issues

Analyze and fix circular dependencies, missing imports, and module resolution issues.

## Context: $ARGUMENTS

If no specific file/error provided, perform a full codebase analysis.

## Instructions

### Step 1: Identify the Problem Type

| Symptom | Likely Cause |
|---------|--------------|
| "Cannot find module" | Missing dependency or wrong path |
| "Module not found" | Package not in tsconfig references |
| Runtime undefined errors | Circular dependency |
| Type errors on valid code | Missing type exports |
| "is not a function" at runtime | Circular import causing undefined |

### Step 2: Check Dependency Architecture

The allowed dependency flow is:

```
apps/web ──────────────────────────┐
apps/server ───────────────────────┼──→ shared/* ←── packages/*
                                   │         ↓
                                   │    (DAG only)
                                   │         ↓
                                   └──→ packages/*
```

**Rules:**
- `apps/` can depend on `shared/` and `packages/`
- `packages/` can only depend on `shared/`
- `shared/` can depend on other `shared/` (no cycles)
- Nothing can depend on `apps/`

### Step 3: Analyze Import Graph

Run these commands to find issues:

**Find all imports in a package:**
```bash
grep -r "from '@" packages/<name>/src/
grep -r "from '@" shared/<name>/src/
```

**Check for potential circular imports:**
```bash
# Package importing from apps (NOT ALLOWED)
grep -r "from '@apps" packages/
grep -r "from '@apps" shared/

# Shared package importing from packages (NOT ALLOWED except shared/api)
grep -r "from '@packages" shared/
```

**Visualize dependencies:**
```bash
# List all workspace dependencies
cat packages/*/package.json shared/*/package.json | grep -A 20 '"dependencies"'
```

### Step 4: Common Fixes

**Missing tsconfig reference:**
```json
// tsconfig.json (root)
{
    "references": [
        { "path": "packages/<missing-package>" }
    ]
}
```

**Missing workspace dependency:**
```json
// package.json of consuming package
{
    "dependencies": {
        "@shared/<name>": "workspace:*"
    }
}
```
Then run `pnpm install`.

**Circular dependency fix - Extract shared types:**
```typescript
// BEFORE: a.ts imports from b.ts, b.ts imports from a.ts

// AFTER: Create shared types file
// types.ts
export type SharedType = { ... }

// a.ts
import type { SharedType } from './types'

// b.ts
import type { SharedType } from './types'
```

**Circular dependency fix - Use type-only imports:**
```typescript
// Use 'import type' to break runtime cycles
import type { SomeType } from './other-module'
```

**Circular dependency fix - Lazy imports:**
```typescript
// Move import inside function for runtime-only deps
export async function doSomething() {
    const { helper } = await import('./helper')
    return helper()
}
```

### Step 5: Validate Fixes

```bash
# Type check
pnpm lint

# Ensure no runtime errors
pnpm test

# Check specific package
pnpm --filter @packages/<name> test
```

## Detecting Circular Dependencies

### Method 1: TypeScript Errors
Circular dependencies often cause:
- "implicitly has type 'any'"
- "used before being assigned"
- "Cannot access before initialization"

### Method 2: Runtime Undefined
```typescript
// If you see this at runtime:
console.log(importedValue)  // undefined
// The module might have a circular import
```

### Method 3: Manual Trace
1. Start from the error location
2. Follow imports backward
3. Look for a path that returns to the starting file

### Method 4: Madge Tool (optional)
```bash
npx madge --circular packages/
npx madge --circular shared/
```

## Architecture Violations to Look For

1. **packages/ importing from apps/**
   ```typescript
   // BAD - in packages/posts/src/router.ts
   import { something } from '@apps/server'
   ```

2. **shared/ importing from packages/** (except shared/api)
   ```typescript
   // BAD - in shared/lib/src/index.ts
   import { posts } from '@packages/posts'
   ```

3. **Circular between shared packages**
   ```typescript
   // BAD - shared/a imports shared/b, shared/b imports shared/a
   ```

## Checklist

- [ ] Identified problem type (missing module, circular, etc.)
- [ ] Traced import graph
- [ ] Verified dependency architecture rules
- [ ] Applied appropriate fix
- [ ] All tsconfig references present
- [ ] All workspace dependencies declared
- [ ] `pnpm install` run after package.json changes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
