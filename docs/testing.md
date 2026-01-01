# Testing Guide

This document provides comprehensive guidelines for implementing tests in the Ignite monorepo.

## Overview

Ignite uses **Node.js built-in test runner** (`node:test`) for all testing. This approach provides:

- Zero external dependencies for testing
- Native TypeScript support via `tsx`
- Built-in assertions, mocking, and coverage
- Fast execution

## Running Tests

```bash
# Run all tests across the monorepo
pnpm test

# Run tests for a specific package
pnpm --filter @apps/server test
pnpm --filter @packages/posts test
pnpm --filter @shared/database test
pnpm --filter @shared/auth test

# Run with coverage (server only)
pnpm --filter @apps/server test
```

## Test File Structure

### Naming Convention

- Test files: `*.test.ts` or `*.spec.ts`
- Location: `src/tests/` directory within each package

### Directory Structure

```
packages/my-feature/
├── src/
│   ├── router.ts
│   ├── index.ts
│   └── tests/
│       └── router.test.ts
```

## Writing Tests

### Basic Test Structure

```typescript
import assert from 'node:assert/strict'
import test, { describe } from 'node:test'

describe('My Feature', () => {
    test('should do something', () => {
        const result = myFunction()
        assert.equal(result, expectedValue)
    })
})
```

### Unit Tests

Unit tests verify individual functions and modules in isolation.

```typescript
import assert from 'node:assert/strict'
import test, { describe } from 'node:test'
import { createId } from '../utils'

describe('createId', () => {
    test('generates a string id', () => {
        const id = createId()
        assert.equal(typeof id, 'string')
    })

    test('generates unique ids', () => {
        const id1 = createId()
        const id2 = createId()
        assert.notEqual(id1, id2)
    })
})
```

### Integration Tests (API)

Integration tests verify API endpoints work correctly end-to-end.

```typescript
import assert from 'node:assert/strict'
import test, { after, before, describe } from 'node:test'
import { createApiClient } from '@shared/api/client'
import { createTestContext } from '@shared/context/testing'
import { startServer } from '../server'

const controller = new AbortController()
const TEST_PORT = 3013
const TEST_BASE_URL = `http://localhost:${TEST_PORT}`

const context = await createTestContext()

before(async () => {
    await startServer({
        signal: controller.signal,
        port: TEST_PORT,
        hostname: 'localhost',
        context,
    })
})

describe('Posts API', () => {
    test('create new post', async () => {
        const api = createApiClient(TEST_BASE_URL)

        const result = await api.posts.create.mutate({
            title: 'Test Post',
            content: 'Test content',
        })

        assert.ok(result.id)
    })

    test('list posts', async () => {
        const api = createApiClient(TEST_BASE_URL)

        const posts = await api.posts.list.query()

        assert.ok(Array.isArray(posts))
    })
})

after(async () => {
    controller.abort()
    await context.close()
})
```

### Router Unit Tests (tRPC)

Test tRPC routers directly without HTTP overhead.

```typescript
import assert from 'node:assert/strict'
import test, { after, describe } from 'node:test'
import { createTestContext } from '@shared/context/testing'
import { posts } from '../router'

const context = await createTestContext()

describe('Posts Router', () => {
    test('create inserts post into database', async () => {
        const caller = posts.createCaller({
            db: context.db,
            session: {
                session: { id: 'S0001', userId: 'U0001', createdAt: new Date(), updatedAt: new Date() },
                user: { id: 'U0001', email: 'test@example.com', name: 'Test User' },
            },
        })

        const result = await caller.create({
            title: 'Test Post',
            content: 'Test content',
        })

        assert.ok(result.id)
    })

    after(async () => {
        await context.close()
    })
})
```

## Test Context

The `@shared/context/testing` module provides a pre-configured test context:

```typescript
import { createTestContext } from '@shared/context/testing'

const context = await createTestContext()

// Access database
context.db

// Access auth service
context.auth

// Clean up when done
await context.close()
```

### Test User

The test context automatically creates a test user:

- **ID**: `U0001`
- **Email**: `johndoe@example.com`
- **Name**: `John Doe`

## Assertions

Use `node:assert/strict` for assertions:

```typescript
import assert from 'node:assert/strict'

// Equality
assert.equal(actual, expected)
assert.notEqual(actual, expected)
assert.deepEqual(actual, expected)

// Truthiness
assert.ok(value)

// Errors
assert.throws(() => throwingFunction())
await assert.rejects(async () => asyncThrowingFunction())

// Custom message
assert.equal(actual, expected, 'Custom error message')
```

## Test Hooks

```typescript
import test, { after, afterEach, before, beforeEach, describe } from 'node:test'

describe('My Suite', () => {
    before(() => {
        // Runs once before all tests in this suite
    })

    beforeEach(() => {
        // Runs before each test
    })

    afterEach(() => {
        // Runs after each test
    })

    after(() => {
        // Runs once after all tests in this suite
    })

    test('my test', () => {
        // Test implementation
    })
})
```

## Best Practices

### 1. Clean Up After Tests

Always clean up created data to avoid test pollution:

```typescript
describe('Posts', () => {
    const createdIds: string[] = []

    test('create post', async () => {
        const result = await createPost()
        createdIds.push(result.id)
    })

    after(async () => {
        for (const id of createdIds) {
            await db.delete(schema.posts).where(eq(schema.posts.id, id))
        }
    })
})
```

### 2. Use Different Ports for Integration Tests

Avoid port conflicts by using unique ports per test file:

```typescript
// health.test.ts
const TEST_PORT = 3011

// api.post.test.ts
const TEST_PORT = 3013
```

### 3. Test Error Cases

Always test validation and error scenarios:

```typescript
test('fails with empty title', async () => {
    await assert.rejects(
        async () => {
            await api.posts.create.mutate({ title: '', content: 'Content' })
        },
        (error: Error) => {
            assert.ok(error.message.includes('Title is required'))
            return true
        },
    )
})
```

### 4. Keep Tests Isolated

Each test should be independent and not rely on other tests' state.

### 5. Use Descriptive Test Names

```typescript
// Good
test('create post with valid data returns post id', async () => {})
test('create post with empty title fails validation', async () => {})

// Bad
test('test1', async () => {})
test('works', async () => {})
```

## Adding Tests to a New Package

1. Create test directory:
```bash
mkdir -p packages/my-feature/src/tests
```

2. Add test script to `package.json`:
```json
{
    "scripts": {
        "test": "tsx --test src/tests/**/*.test.ts"
    },
    "devDependencies": {
        "tsx": "^4.20.5"
    }
}
```

3. Create test file:
```typescript
// packages/my-feature/src/tests/router.test.ts
import assert from 'node:assert/strict'
import test, { describe } from 'node:test'

describe('My Feature', () => {
    test('works correctly', () => {
        assert.ok(true)
    })
})
```

4. Run tests:
```bash
pnpm --filter @packages/my-feature test
```

## Coverage

The server package includes coverage reporting:

```bash
pnpm --filter @apps/server test
```

This runs with `--experimental-test-coverage` flag.

## Troubleshooting

### Tests timeout

Increase timeout for slow operations:

```typescript
test('slow operation', { timeout: 10000 }, async () => {
    // Test that takes longer than default 30s
})
```

### Database connection issues

Ensure `DATABASE_URL` is set in `.env` file and the database is running.

### Port already in use

Use unique ports for each test file or ensure previous test runs completed cleanup.
