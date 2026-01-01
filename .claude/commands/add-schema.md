# Add Database Schema

Add a new database table schema to the Ignite monorepo using Drizzle ORM.

## Table Name: $ARGUMENTS

## Instructions

Follow these steps to add a properly structured database schema:

### 1. Validate Table Name

- Table name should be snake_case for the database (e.g., `user_profiles`, `post_comments`)
- TypeScript export should be camelCase (e.g., `userProfiles`, `postComments`)
- File name should be kebab-case (e.g., `user-profiles.ts`, `post-comments.ts`)

### 2. Create Schema File

Create `shared/database/src/schema/<table-name>.ts`:

```typescript
import { pgTable, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core'
import { createId } from '../utils'

export const <tableName> = pgTable('<table_name>', {
    // Primary key (always include)
    id: text('id')
        .primaryKey()
        .$defaultFn(() => createId()),

    // Your columns here
    // Examples:
    // name: text('name').notNull(),
    // email: text('email').notNull().unique(),
    // description: text('description'),
    // count: integer('count').default(0),
    // isActive: boolean('is_active').default(true),

    // Foreign keys (if referencing other tables)
    // userId: text('user_id').notNull().references(() => user.id),

    // Timestamps (recommended)
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
})
```

### 3. Export from Schema Index

Update `shared/database/src/schema/index.ts`:

```typescript
export * from './auth'
export * from './<table-name>'  // Add this line
```

### 4. Apply Schema to Database

Run:
```bash
pnpm db:push
```

## Common Column Types

| Drizzle Type | PostgreSQL | Usage |
|--------------|------------|-------|
| `text('col')` | TEXT | Strings (no length limit) |
| `varchar('col', { length: 255 })` | VARCHAR(255) | Limited strings |
| `integer('col')` | INTEGER | Whole numbers |
| `bigint('col', { mode: 'number' })` | BIGINT | Large numbers |
| `boolean('col')` | BOOLEAN | True/false |
| `timestamp('col')` | TIMESTAMP | Date and time |
| `date('col')` | DATE | Date only |
| `json('col')` | JSON | JSON data |
| `jsonb('col')` | JSONB | Binary JSON (faster queries) |
| `real('col')` | REAL | Floating point |
| `doublePrecision('col')` | DOUBLE PRECISION | High precision float |
| `serial('col')` | SERIAL | Auto-increment |

## Column Modifiers

| Modifier | Description |
|----------|-------------|
| `.notNull()` | Column cannot be NULL |
| `.unique()` | Column values must be unique |
| `.default(value)` | Default value if not provided |
| `.defaultNow()` | Default to current timestamp |
| `.$defaultFn(() => fn())` | Dynamic default via function |
| `.references(() => table.col)` | Foreign key reference |

## Example Schemas

### Basic Entity

```typescript
export const categories = pgTable('categories', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow(),
})
```

### Entity with Foreign Key

```typescript
import { user } from './auth'

export const userProfiles = pgTable('user_profiles', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    userId: text('user_id').notNull().references(() => user.id),
    bio: text('bio'),
    avatarUrl: text('avatar_url'),
    website: text('website'),
    updatedAt: timestamp('updated_at').defaultNow(),
})
```

### Join Table (Many-to-Many)

```typescript
export const postTags = pgTable('post_tags', {
    postId: text('post_id').notNull().references(() => posts.id),
    tagId: text('tag_id').notNull().references(() => tags.id),
}, (table) => ({
    pk: primaryKey({ columns: [table.postId, table.tagId] }),
}))
```

### Entity with JSON

```typescript
export const settings = pgTable('settings', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    userId: text('user_id').notNull().unique().references(() => user.id),
    preferences: jsonb('preferences').$type<{
        theme: 'light' | 'dark'
        notifications: boolean
        language: string
    }>().default({ theme: 'light', notifications: true, language: 'en' }),
    updatedAt: timestamp('updated_at').defaultNow(),
})
```

## Indexes (Optional)

```typescript
import { index } from 'drizzle-orm/pg-core'

export const posts = pgTable('posts', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    title: text('title').notNull(),
    authorId: text('author_id').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
    authorIdx: index('posts_author_idx').on(table.authorId),
    createdAtIdx: index('posts_created_at_idx').on(table.createdAt),
}))
```

## Checklist

- [ ] Schema file created in `shared/database/src/schema/`
- [ ] Using `createId()` for primary key
- [ ] Appropriate column types and modifiers
- [ ] Exported from `shared/database/src/schema/index.ts`
- [ ] Database schema pushed with `pnpm db:push`
- [ ] Foreign keys reference existing tables correctly

## After Creating Schema

If this schema is for a new feature, you may want to:

1. Create a tRPC router to interact with this table
2. Use `/add-router` command to create the router
3. Or use `/new-feature` command for complete feature setup
