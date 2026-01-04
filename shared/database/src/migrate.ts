import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

async function runMigrations() {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is not set')
    }

    console.log('Running database migrations...')

    const client = postgres(databaseUrl, { max: 1 })
    const db = drizzle(client)

    await migrate(db, { migrationsFolder: './drizzle' })

    console.log('Migrations completed successfully')
    await client.end()
}

runMigrations().catch((err) => {
    console.error('Migration failed:', err)
    process.exit(1)
})
