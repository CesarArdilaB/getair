# Setup Environment

Initialize the development environment from scratch or reset configuration.

## Context: $ARGUMENTS

Options: `fresh` (new setup), `reset` (reset existing), or blank for guided setup.

## Instructions

### Step 1: Check Prerequisites

Verify required tools are installed:

```bash
# Node.js v22.x
node --version

# pnpm
pnpm --version

# PostgreSQL (local or Docker)
psql --version
# OR
docker --version
```

### Step 2: Clone and Install (if fresh)

```bash
# If not already cloned
git clone <repo-url> ignite
cd ignite

# Install dependencies
pnpm install
```

### Step 3: Create Environment File

Copy the example environment file:

```bash
cp apps/server/.env.example .env
```

### Step 4: Configure Environment Variables

Edit `.env` with your values:

```env
# Database connection
DATABASE_URL=postgresql://user:password@localhost:5432/ignition

# Frontend URL for CORS
CLIENT_URL=http://localhost:5173
```

**Local PostgreSQL setup:**
```bash
# Create database
createdb ignition

# Or with Docker
docker run --name ignite-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ignition -p 5432:5432 -d postgres:16
```

**Connection string format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

Examples:
- Local: `postgresql://postgres:password@localhost:5432/ignition`
- Docker: `postgresql://postgres:password@localhost:5432/ignition`
- Remote: `postgresql://user:pass@db.example.com:5432/ignition`

### Step 5: Initialize Database

Push the schema to create tables:

```bash
pnpm db:push
```

### Step 6: Verify Setup

Run tests to ensure everything works:

```bash
# Run all tests
pnpm test

# Start development server
pnpm dev
```

The app should be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Step 7: Optional - Drizzle Studio

View and manage your database:

```bash
pnpm drizzle-kit studio
```

## Troubleshooting

### "Connection refused" to database

1. Check PostgreSQL is running:
   ```bash
   # macOS with Homebrew
   brew services list | grep postgresql

   # Docker
   docker ps | grep postgres
   ```

2. Verify connection string in `.env`

3. Check database exists:
   ```bash
   psql -l | grep ignition
   ```

### "EACCES: permission denied"

Node modules may have wrong permissions:
```bash
rm -rf node_modules
pnpm install
```

### "Port already in use"

Kill the process using the port:
```bash
# Find process on port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

### "Module not found" errors

TypeScript references might be stale:
```bash
pnpm install
pnpm lint
```

### Tests fail with database errors

Ensure test database is accessible:
```bash
# Verify DATABASE_URL is set
echo $DATABASE_URL

# Re-push schema
pnpm db:push
```

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://...` |
| `CLIENT_URL` | Yes | Frontend URL for CORS | `http://localhost:5173` |

## Reset Environment

If you need to start fresh:

```bash
# Remove node_modules and reinstall
rm -rf node_modules
rm -rf **/node_modules
pnpm install

# Reset database
pnpm db:push --force

# Clear build artifacts
rm -rf **/dist
rm -rf **/*.tsbuildinfo
```

## Checklist

- [ ] Node.js v22.x installed
- [ ] pnpm installed
- [ ] PostgreSQL running (local or Docker)
- [ ] Repository cloned
- [ ] `pnpm install` completed
- [ ] `.env` file created from `.env.example`
- [ ] `DATABASE_URL` configured
- [ ] `CLIENT_URL` configured
- [ ] `pnpm db:push` successful
- [ ] `pnpm test` passes
- [ ] `pnpm dev` starts without errors
