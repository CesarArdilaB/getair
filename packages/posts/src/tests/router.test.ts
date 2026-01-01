import assert from 'node:assert/strict'
import test, { after, describe } from 'node:test'
import { createTestContext } from '@shared/context/testing'
import { schema } from '@shared/database'
import { eq } from 'drizzle-orm'
import { posts } from '../router'

const context = await createTestContext()

describe('Posts Router', () => {
    const createdPostIds: string[] = []

    test('list returns empty array when no posts exist', async () => {
        // Clean up any existing posts first
        await context.db.delete(schema.posts)

        const caller = posts.createCaller({
            db: context.db,
            session: {
                session: {
                    id: 'S0001',
                    userId: 'U0001',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                user: {
                    id: 'U0001',
                    email: 'johndoe@example.com',
                    name: 'John Doe',
                },
            },
        })

        const result = await caller.list()

        assert.ok(Array.isArray(result), 'Should return an array')
        assert.equal(result.length, 0, 'Should be empty')
    })

    test('create inserts post into database', async () => {
        const caller = posts.createCaller({
            db: context.db,
            session: {
                session: {
                    id: 'S0001',
                    userId: 'U0001',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                user: {
                    id: 'U0001',
                    email: 'johndoe@example.com',
                    name: 'John Doe',
                },
            },
        })

        const result = await caller.create({
            title: 'Unit Test Post',
            content: 'Content from unit test',
        })

        assert.ok(result.id, 'Should return post id')
        createdPostIds.push(result.id)

        // Verify in database
        const [dbPost] = await context.db
            .select()
            .from(schema.posts)
            .where(eq(schema.posts.id, result.id))

        assert.ok(dbPost, 'Post should exist in database')
        assert.equal(dbPost.title, 'Unit Test Post')
        assert.equal(dbPost.content, 'Content from unit test')
        assert.equal(dbPost.authorId, 'U0001')
    })

    test('list returns created posts with correct fields', async () => {
        const caller = posts.createCaller({
            db: context.db,
            session: {
                session: {
                    id: 'S0001',
                    userId: 'U0001',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                user: {
                    id: 'U0001',
                    email: 'johndoe@example.com',
                    name: 'John Doe',
                },
            },
        })

        const result = await caller.list()

        assert.ok(result.length > 0, 'Should have posts')
        const post = result[0]
        assert.ok('id' in post, 'Should have id field')
        assert.ok('title' in post, 'Should have title field')
        assert.ok('content' in post, 'Should have content field')
    })

    // Cleanup
    after(async () => {
        for (const id of createdPostIds) {
            await context.db.delete(schema.posts).where(eq(schema.posts.id, id))
        }
        await context.close()
    })
})
