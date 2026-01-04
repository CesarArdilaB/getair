FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Copy source
COPY . .

# Install deps (with cache)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Build the server
RUN pnpm --filter server build

# Build the web app
RUN pnpm --filter web build

# Production stage
FROM node:22-alpine

# Set environment variables
ENV NODE_ENV=production
ENV DOCKER=1

# Copy server bundle
COPY --from=builder /app/apps/server/dist /apps/server/dist

# Frontend files (React web app)
COPY --from=builder /app/apps/web/dist /apps/server/public

WORKDIR /apps/server

# Expose port (Fly.io uses 8080)
EXPOSE 8080

CMD ["node", "dist/main.cjs"]
