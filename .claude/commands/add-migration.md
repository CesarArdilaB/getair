# Generate a Database Migration

Create and apply a Drizzle ORM migration for schema changes.

## Migration Description: $ARGUMENTS

## Prerequisites

- Database is running and accessible via `DATABASE_URL`
- Schema changes have been made in `shared/database/src/schema/`

## Instructions

### Step 1: Review Schema Changes

Check what schema changes need migration:

```bash
# View current schema files
ls shared/database/src/schema/
```

Common schema locations:
- `shared/database/src/schema/posts.ts` - Posts table
- `shared/database/src/schema/users.ts` - Users table (Better Auth)
- `shared/database/src/schema/index.ts` - Schema exports

### Step 2: Make Schema Changes (if not done)

Edit or create schema files in `shared/database/src/schema/`:

**Adding a new table:**
```typescript
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '../utils'

export const myTable = pgTable('my_table', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
})
```

**Adding a column:**
```typescript
// Add to existing table definition
export const posts = pgTable('posts', {
    // ... existing columns
    newColumn: text('new_column'),  // Add new column
})
```

**Adding a foreign key:**
```typescript
import { foreignKey } from 'drizzle-orm/pg-core'

export const comments = pgTable('comments', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    postId: text('post_id').notNull().references(() => posts.id),
    // ...
})
```

### Step 3: Export New Schema

Update `shared/database/src/schema/index.ts`:
```typescript
export * from './posts'
export * from './myTable'  // Add new export
```

### Step 4: Generate Migration

**Option A: Push directly (development)**
```bash
pnpm db:push
```
This applies changes directly without creating migration files. Good for rapid development.

**Option B: Generate migration file (production)**
```bash
pnpm drizzle-kit generate
```
This creates a migration file in the migrations directory.

### Step 5: Apply Migration (if using migration files)

```bash
pnpm drizzle-kit migrate
```

### Step 6: Verify Changes

```bash
# Check database connection and schema
pnpm drizzle-kit studio
```

This opens Drizzle Studio to inspect the database.

## Common Migration Patterns

### Adding an Index
```typescript
import { index, pgTable, text } from 'drizzle-orm/pg-core'

export const posts = pgTable('posts', {
    id: text('id').primaryKey(),
    authorId: text('author_id').notNull(),
}, (table) => ({
    authorIdx: index('posts_author_idx').on(table.authorId),
}))
```

### Adding a Unique Constraint
```typescript
import { pgTable, text, unique } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
}, (table) => ({
    emailUnique: unique('users_email_unique').on(table.email),
}))
```

### Nullable to Required (with default)
```typescript
// Before
name: text('name'),

// After - add notNull with a default for existing rows
name: text('name').notNull().default('Unknown'),
```

## Troubleshooting

### "Column already exists"
The schema might be out of sync. Try:
```bash
pnpm drizzle-kit push --force
```

### "Relation does not exist"
Ensure foreign key references point to existing tables that are created first.

### "Cannot drop column with dependent objects"
Drop dependent objects (indexes, constraints) first in a separate migration.

## Checklist

- [ ] Schema changes made in `shared/database/src/schema/`
- [ ] New schemas exported from `index.ts`
- [ ] Migration generated or pushed
- [ ] Database updated successfully
- [ ] Verified with Drizzle Studio or test query
- [ ] Related router code updated (if needed)
- [ ] Tests updated and passing
