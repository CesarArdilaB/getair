# Create a New Feature Package

Create a complete feature package in the Ignite monorepo with proper structure, tRPC router, database schema (if needed), tests, and all necessary configuration.

## Feature Name: $ARGUMENTS

## Instructions

Follow these steps precisely to create a production-ready feature package:

### 1. Validate Feature Name

- Feature name should be lowercase, kebab-case (e.g., `user-profiles`, `comments`, `notifications`)
- Package will be named `@packages/<feature-name>`
- Router will be named using camelCase (e.g., `userProfiles`, `comments`)

### 2. Create Package Structure

Create the following directory structure:
```
packages/<feature-name>/
├── src/
│   ├── router.ts       # tRPC router with procedures
│   ├── index.ts        # Package exports
│   └── tests/
│       └── router.test.ts  # Router tests
├── package.json
└── tsconfig.json
```

### 3. Create package.json

```json
{
    "name": "@packages/<feature-name>",
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

### 4. Create tsconfig.json

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

### 5. Create the Router (src/router.ts)

Create a tRPC router with standard CRUD procedures:
- `list` - Query to list all items (protectedProcedure)
- `getById` - Query to get single item by ID (protectedProcedure)
- `create` - Mutation to create new item (protectedProcedure)
- `update` - Mutation to update existing item (protectedProcedure)
- `delete` - Mutation to delete item (protectedProcedure)

Use Zod for input validation with appropriate error messages.
Use proper output types for type safety.
Access `ctx.db` for database operations and `ctx.session.user.id` for the current user.

### 6. Create Index Export (src/index.ts)

Export the router:
```typescript
export { <routerName> } from './router'
```

### 7. Create Tests (src/tests/router.test.ts)

Write comprehensive tests covering:
- All CRUD operations
- Input validation (empty strings, missing fields)
- Authorization (correct user access)
- Error cases

Use `createTestContext()` from `@shared/context/testing` and `router.createCaller()` for direct testing.

### 8. Add Database Schema (if needed)

If this feature needs a new database table:

1. Create schema file in `shared/database/src/schema/<feature-name>.ts`
2. Export from `shared/database/src/schema/index.ts`
3. Use `createId()` for primary keys
4. Include standard fields: `id`, `createdAt`, `updatedAt` where appropriate

### 9. Register in API Router

Update `shared/api/src/server/root.ts`:
```typescript
import { <routerName> } from '@packages/<feature-name>'

export const appRouter = router({
    // ... existing routers
    <routerName>,
})
```

Also update the package.json dependencies:
```json
{
    "dependencies": {
        "@packages/<feature-name>": "workspace:*"
    }
}
```

### 10. Update Root tsconfig.json

Add reference:
```json
{
    "references": [
        { "path": "packages/<feature-name>" }
    ]
}
```

### 11. Install Dependencies and Test

Run:
```bash
pnpm install
pnpm --filter @packages/<feature-name> test
pnpm test  # Run all tests to ensure nothing is broken
```

### 12. Format Code

```bash
pnpm format
```

## Example Output Structure

For a feature called "comments":

```
packages/comments/
├── src/
│   ├── router.ts
│   ├── index.ts
│   └── tests/
│       └── router.test.ts
├── package.json
└── tsconfig.json
```

Router name: `comments`
API access: `api.comments.list()`, `api.comments.create()`, etc.

## Checklist

- [ ] Package directory created
- [ ] package.json with correct dependencies
- [ ] tsconfig.json extending root config
- [ ] Router with CRUD procedures
- [ ] Index file exporting router
- [ ] Tests covering all procedures
- [ ] Database schema (if applicable)
- [ ] Registered in appRouter
- [ ] Added to root tsconfig.json references
- [ ] Dependencies installed
- [ ] All tests passing
- [ ] Code formatted
