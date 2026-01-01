import assert from 'node:assert/strict'
import test, { after, describe } from 'node:test'
import { createDBClient, schema } from '@shared/database'
import { eq } from 'drizzle-orm'
import { createTestingAuthService } from '../services/testing'

const db = createDBClient()

describe('Testing Auth Service', () => {
    test('createTestingAuthService creates test user', async () => {
        const _authService = await createTestingAuthService(db)

        // Verify user was created
        const [user] = await db
            .select()
            .from(schema.user)
            .where(eq(schema.user.id, 'U0001'))

        assert.ok(user, 'Test user should exist')
        assert.equal(user.id, 'U0001')
        assert.equal(user.email, 'johndoe@example.com')
        assert.equal(user.name, 'John Doe')
    })

    test('getSession returns valid session', async () => {
        const authService = await createTestingAuthService(db)

        const session = await authService.getSession()

        assert.ok(session, 'Should return a session')
        assert.ok(session.session, 'Should have session object')
        assert.ok(session.user, 'Should have user object')
        assert.equal(session.user.id, 'U0001')
        assert.equal(session.user.email, 'johndoe@example.com')
        assert.equal(session.session.userId, 'U0001')
    })

    test('handler throws not implemented error', async () => {
        const authService = await createTestingAuthService(db)

        assert.throws(
            () => authService.handler(),
            { message: 'No implement' },
            'Handler should throw not implemented error',
        )
    })

    test('createTestingAuthService is idempotent', async () => {
        // Call multiple times - should not fail due to duplicate user
        await createTestingAuthService(db)
        await createTestingAuthService(db)

        const users = await db
            .select()
            .from(schema.user)
            .where(eq(schema.user.id, 'U0001'))

        assert.equal(users.length, 1, 'Should only have one test user')
    })

    after(async () => {
        await db.$client.end()
    })
})
