# Run Tests and Fix Issues

Run tests across the Ignite monorepo and fix any failing tests.

## Scope: $ARGUMENTS

Expected: `all`, a package name like `@packages/posts`, or empty for all tests

## Instructions

### 1. Run Tests

**Run all tests:**
```bash
pnpm test
```

**Run specific package tests:**
```bash
pnpm --filter @packages/posts test
pnpm --filter @apps/server test
pnpm --filter @shared/database test
pnpm --filter @shared/auth test
```

**Run with coverage (server only):**
```bash
pnpm --filter @apps/server test
```

### 2. Analyze Failures

For each failing test, identify:
- Which test is failing
- The assertion that failed
- The expected vs actual values
- The root cause (code bug, test bug, missing setup)

### 3. Common Issues and Fixes

#### Database Connection Errors

**Symptom:** `ECONNREFUSED` or connection timeout

**Solutions:**
1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in `.env` file
3. Verify database exists: `psql -U postgres -c "\l"`

#### Port Already in Use

**Symptom:** `EADDRINUSE` error

**Solutions:**
1. Kill process using the port: `lsof -ti:PORT | xargs kill -9`
2. Use different test ports for different test files
3. Ensure proper cleanup in `after()` hooks

#### Missing Test Context

**Symptom:** `ctx.db is undefined` or similar

**Solution:**
```typescript
import { createTestContext } from '@shared/context/testing'

const context = await createTestContext()  // Must be awaited!

// Use in tests
const caller = router.createCaller({
    db: context.db,
    session: mockSession,
})
```

#### Floating Promises

**Symptom:** Biome error `noFloatingPromises`

**Solution:** Always await promises:
```typescript
// Bad
context.close()

// Good
await context.close()
```

#### Timeout Errors

**Symptom:** Test times out after 30 seconds

**Solutions:**
1. Increase timeout for slow operations:
   ```typescript
   test('slow test', { timeout: 10000 }, async () => {
       // ...
   })
   ```
2. Check for unresolved promises
3. Ensure database queries return

#### Validation Errors

**Symptom:** Zod validation error in test

**Solution:** Ensure test data matches schema:
```typescript
// If schema requires min length 1
await caller.create({ name: '' })  // Will fail
await caller.create({ name: 'Valid' })  // Will pass
```

#### Session Not Available

**Symptom:** `ctx.session is undefined` in protectedProcedure

**Solution:** Provide mock session:
```typescript
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

const caller = router.createCaller({
    db: context.db,
    session: mockSession,
})
```

### 4. Test Structure Best Practices

**Always clean up:**
```typescript
import test, { after, before, describe } from 'node:test'

const context = await createTestContext()

describe('My Tests', () => {
    // Tests here
})

after(async () => {
    await context.close()  // ALWAYS close context
})
```

**Use unique ports:**
```typescript
// health.test.ts
const TEST_PORT = 3011

// api.test.ts
const TEST_PORT = 3012

// posts.test.ts
const TEST_PORT = 3013
```

**Clean up created data:**
```typescript
describe('Posts', () => {
    const createdIds: string[] = []

    test('create', async () => {
        const result = await caller.create({ title: 'Test' })
        createdIds.push(result.id)
    })

    after(async () => {
        // Clean up created items
        for (const id of createdIds) {
            await context.db
                .delete(schema.posts)
                .where(eq(schema.posts.id, id))
        }
    })
})
```

### 5. Running Type Check

Before committing, also run type check:
```bash
pnpm lint
```

### 6. Formatting

Ensure code is formatted:
```bash
pnpm format
```

## Test Command Reference

| Command | Description |
|---------|-------------|
| `pnpm test` | Run all tests |
| `pnpm --filter <pkg> test` | Run tests for specific package |
| `pnpm lint` | Type check with TypeScript |
| `pnpm format` | Format code with Biome |

## Debugging Tests

**Add console output:**
```typescript
test('debug test', async () => {
    const result = await caller.create({ name: 'Test' })
    console.log('Created:', result)  // Will show in test output
    assert.ok(result.id)
})
```

**Run single test file:**
```bash
tsx --test packages/posts/src/tests/router.test.ts
```

**Run tests matching pattern:**
```bash
tsx --test --test-name-pattern="create" packages/posts/src/tests/router.test.ts
```

## Checklist After Fixing

- [ ] All tests pass (`pnpm test`)
- [ ] Type check passes (`pnpm lint`)
- [ ] Code is formatted (`pnpm format`)
- [ ] No uncommitted changes from fixes
- [ ] Tests cover the bug that was fixed (if applicable)
