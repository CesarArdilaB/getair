# Review Pull Request

Review code changes against the Ignite architecture rules and best practices.

## PR Reference: $ARGUMENTS

If a PR number or branch is provided, review those changes. Otherwise, review uncommitted changes.

## Instructions

### Step 1: Gather Changes

**For uncommitted changes:**
```bash
git status
git diff
git diff --staged
```

**For a specific PR:**
```bash
gh pr view <number> --json files,additions,deletions
gh pr diff <number>
```

**For a branch:**
```bash
git diff main...<branch-name>
```

### Step 2: Architecture Compliance

Check each category:

#### 2.1 Dependency Rules

**Verify no architecture violations:**

| From | Can Import | Cannot Import |
|------|------------|---------------|
| `apps/*` | `shared/*`, `packages/*` | - |
| `packages/*` | `shared/*` | `apps/*`, other `packages/*` |
| `shared/*` | other `shared/*` (DAG) | `apps/*`, `packages/*` |

**Check for violations:**
```bash
# packages/ should not import from apps/
grep -r "from '@apps" packages/

# shared/ should not import from packages/ (except shared/api)
grep -r "from '@packages" shared/ | grep -v "shared/api"
```

#### 2.2 No Global State

Look for violations:
- `export const db = ...` (singleton)
- `let globalState = ...` (mutable global)
- `class Service { static instance }` (singleton pattern)

**Correct pattern:**
```typescript
// Dependencies passed via context
export const myRouter = router({
    myProcedure: protectedProcedure.query(({ ctx }) => {
        ctx.db  // ✓ Injected
        ctx.auth  // ✓ Injected
    })
})
```

#### 2.3 Export Rules

Check `package.json` exports:
- Backend and frontend code separated
- No mixing in root export

```json
// ✓ Good
{
    "exports": {
        "./client": "./src/client.ts",
        "./server": "./src/server.ts"
    }
}

// ✗ Bad - mixed exports
{
    "exports": {
        ".": "./src/index.ts"  // Contains both client and server code
    }
}
```

#### 2.4 TypeScript References

New packages must be in root `tsconfig.json`:
```json
{
    "references": [
        { "path": "packages/new-package" }
    ]
}
```

### Step 3: Code Quality

#### 3.1 tRPC Procedures

Check for:
- [ ] Proper input validation with Zod
- [ ] Output types defined for mutations
- [ ] Correct procedure type (`publicProcedure` vs `protectedProcedure`)
- [ ] Consistent naming (`list`, `getById`, `create`, `update`, `delete`)

```typescript
// ✓ Good
create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .output(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => { ... })

// ✗ Bad - no validation
create: protectedProcedure
    .mutation(async ({ ctx, input }) => { ... })
```

#### 3.2 Database Queries

Check for:
- [ ] Using `ctx.db` (not global db)
- [ ] Proper error handling for not found
- [ ] User scoping where needed (`authorId: ctx.session.user.id`)

#### 3.3 Error Handling

Check for:
- [ ] Using `TRPCError` with appropriate codes
- [ ] Meaningful error messages
- [ ] No swallowed errors

```typescript
// ✓ Good
if (!item) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Item not found' })
}

// ✗ Bad - generic error
if (!item) {
    throw new Error('error')
}
```

### Step 4: Testing

Check for:
- [ ] New features have tests
- [ ] Tests use `createTestContext()`
- [ ] Tests cover happy path and error cases
- [ ] Cleanup in `after()` hook

### Step 5: Security

Check for:
- [ ] No hardcoded secrets
- [ ] SQL injection safe (using Drizzle ORM)
- [ ] Authorization checks in place
- [ ] No sensitive data in logs

### Step 6: Code Style

Run Biome checks:
```bash
pnpm format --check
pnpm lint
```

Check for:
- [ ] 4-space indentation
- [ ] Single quotes
- [ ] No floating promises
- [ ] Imports organized

## Review Output Format

Provide feedback in this format:

```markdown
## PR Review: [Title/Number]

### Summary
[Brief overview of changes]

### Architecture Compliance
- ✓ Dependency flow correct
- ✗ Issue: [description]

### Code Quality
- ✓ Input validation present
- ✗ Missing output type on `create` mutation

### Testing
- ✓ Tests added for new endpoints
- ✗ Missing error case tests

### Security
- ✓ No issues found

### Suggestions
1. [Suggestion 1]
2. [Suggestion 2]

### Verdict
[ ] Approve
[ ] Request Changes
[ ] Needs Discussion
```

## Quick Checklist

Run through this for every PR:

- [ ] No imports from `apps/` in `shared/` or `packages/`
- [ ] No global state or singletons
- [ ] New packages added to `tsconfig.json` references
- [ ] Input validation on all procedures
- [ ] Protected procedures for authenticated endpoints
- [ ] Tests exist and pass
- [ ] No hardcoded secrets
- [ ] Code formatted (`pnpm format`)
- [ ] Type check passes (`pnpm lint`)
