import assert from 'node:assert/strict'
import test, { after, before, describe } from 'node:test'
import { createApiClient } from '@shared/api/client'
import { createTestContext } from '@shared/context/testing'
import { schema } from '@shared/database'
import { eq } from 'drizzle-orm'
import { startServer } from '../server'

const controller = new AbortController()

const TEST_PORT = 3013
const TEST_HOSTNAME = 'localhost'
const TEST_BASE_URL = `http://${TEST_HOSTNAME}:${TEST_PORT}`

const context = await createTestContext()

before(async () => {
    await startServer({
        signal: controller.signal,
        port: TEST_PORT,
        hostname: TEST_HOSTNAME,
        context,
    })
})

describe('Posts API', () => {
    const createdPostIds: string[] = []

    test('create new post returns id', async () => {
        const api = createApiClient(TEST_BASE_URL)

        const result = await api.posts.create.mutate({
            title: 'Test Post',
            content: 'This is a test post content',
        })

        assert.ok(result.id, 'Should return post id')
        assert.equal(typeof result.id, 'string')
        createdPostIds.push(result.id)
    })

    test('list posts returns created posts', async () => {
        const api = createApiClient(TEST_BASE_URL)

        const posts = await api.posts.list.query()

        assert.ok(Array.isArray(posts), 'Should return an array')
        assert.ok(posts.length > 0, 'Should have at least one post')

        const createdPost = posts.find((p) => createdPostIds.includes(p.id))
        assert.ok(createdPost, 'Should find the created post')
        assert.equal(createdPost.title, 'Test Post')
        assert.equal(createdPost.content, 'This is a test post content')
    })

    test('create post with empty title fails validation', async () => {
        const api = createApiClient(TEST_BASE_URL)

        await assert.rejects(
            async () => {
                await api.posts.create.mutate({
                    title: '',
                    content: 'Content without title',
                })
            },
            (error: Error) => {
                assert.ok(
                    error.message.includes('Title is required'),
                    'Should fail with title validation error',
                )
                return true
            },
        )
    })

    test('create post with empty content fails validation', async () => {
        const api = createApiClient(TEST_BASE_URL)

        await assert.rejects(
            async () => {
                await api.posts.create.mutate({
                    title: 'Title without content',
                    content: '',
                })
            },
            (error: Error) => {
                assert.ok(
                    error.message.includes('Content is required'),
                    'Should fail with content validation error',
                )
                return true
            },
        )
    })

    // Cleanup created posts
    after(async () => {
        for (const id of createdPostIds) {
            await context.db.delete(schema.posts).where(eq(schema.posts.id, id))
        }
    })
})

after(async () => {
    controller.abort()
    await context.close()
})
