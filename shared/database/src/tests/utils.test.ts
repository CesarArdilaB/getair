import assert from 'node:assert/strict'
import test, { describe } from 'node:test'
import { createId } from '../utils'

describe('Database Utils', () => {
    describe('createId', () => {
        test('generates a string id', () => {
            const id = createId()
            assert.equal(typeof id, 'string')
        })

        test('generates id with correct length (10 characters)', () => {
            const id = createId()
            assert.equal(id.length, 10)
        })

        test('generates unique ids', () => {
            const ids = new Set<string>()
            const count = 1000

            for (let i = 0; i < count; i++) {
                ids.add(createId())
            }

            assert.equal(ids.size, count, 'All generated IDs should be unique')
        })

        test('generates ids with only alphanumeric characters', () => {
            const id = createId()
            const alphanumericRegex = /^[A-Za-z0-9]+$/
            assert.ok(
                alphanumericRegex.test(id),
                'ID should only contain alphanumeric characters',
            )
        })
    })
})
