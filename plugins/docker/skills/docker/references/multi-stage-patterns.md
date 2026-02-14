# Multi-Stage Build Patterns

## Why Multi-Stage Builds

Multi-stage builds separate **build-time dependencies** from **runtime artifacts**:
- Build stage: compilers, dev dependencies, build tools
- Runtime stage: only application and runtime dependencies

**Typical size reduction:** 50-90%

## Basic Pattern

```dockerfile
# syntax=docker/dockerfile:1

# Stage 1: Build
FROM node:22 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:22-slim AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

## Named Stages

Always name stages for clarity and selective targeting:

```dockerfile
FROM node:22 AS deps
# Install dependencies

FROM deps AS builder
# Build application

FROM deps AS dev
# Development environment

FROM node:22-slim AS production
# Production image
```

**Build specific stage:**
```bash
docker build --target dev -t myapp:dev .
docker build --target production -t myapp:prod .
```

## Parallel Build Stages

BuildKit executes independent stages in parallel:

```dockerfile
# These stages build in parallel
FROM node:22 AS frontend-builder
WORKDIR /frontend
COPY frontend/ .
RUN npm ci && npm run build

FROM golang:1.23 AS backend-builder
WORKDIR /backend
COPY backend/ .
RUN go build -o server .

# Final stage waits for both
FROM gcr.io/distroless/static AS runtime
COPY --from=backend-builder /backend/server /server
COPY --from=frontend-builder /frontend/dist /static
ENTRYPOINT ["/server"]
```

## Dependency Caching Pattern

Separate dependency installation from code copying for better cache hits:

```dockerfile
FROM node:22-slim AS deps
WORKDIR /app

# Copy only package files first
COPY package.json pnpm-lock.yaml ./

# Install dependencies (cached unless package files change)
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM deps AS builder
# Now copy source code (this layer rebuilds on code changes)
COPY . .
RUN pnpm build

FROM node:22-slim AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/index.js"]
```

## Production-Only Dependencies

Install dev dependencies for build, production dependencies for runtime:

```dockerfile
FROM node:22 AS builder
WORKDIR /app
COPY package*.json ./
# Full install including devDependencies (for building)
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app
COPY package*.json ./
# Production only (no devDependencies)
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/index.js"]
```

## Static Binary Pattern (Go/Rust)

Build to scratch or distroless for minimal images:

```dockerfile
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server .

FROM scratch AS runtime
# Copy CA certificates for HTTPS
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /app/server /server
ENTRYPOINT ["/server"]
```

## Testing Stage Pattern

Include test stage without bloating production image:

```dockerfile
FROM node:22 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS builder
COPY . .
RUN npm run build

FROM deps AS tester
COPY . .
RUN npm test

FROM node:22-slim AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

**Run tests during build:**
```bash
docker build --target tester .  # Fails if tests fail
docker build --target production .  # Skips test stage
```

## Conditional Stages (BuildKit)

Use build args to select stages:

```dockerfile
FROM node:22 AS base
WORKDIR /app

FROM base AS deps-dev
RUN npm install

FROM base AS deps-prod
RUN npm install --production

FROM deps-${BUILD_ENV:-prod} AS deps
# Selected based on BUILD_ENV arg
```

```bash
docker build --build-arg BUILD_ENV=dev .
docker build --build-arg BUILD_ENV=prod .
```

## COPY --from External Images

Copy from any image, not just build stages:

```dockerfile
FROM alpine AS runtime

# Copy binary from official image
COPY --from=busybox:uclibc /bin/busybox /bin/busybox

# Copy certificates
COPY --from=alpine:latest /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
```

## Common Mistakes

### Copying Entire node_modules

```dockerfile
# BAD - Includes devDependencies
COPY --from=builder /app/node_modules ./node_modules

# GOOD - Reinstall production only
RUN npm ci --only=production
# OR use pnpm deploy
RUN pnpm deploy --prod /prod
```

### Not Using Named Stages

```dockerfile
# BAD - Fragile, index-based
COPY --from=0 /app/dist ./dist

# GOOD - Named and clear
COPY --from=builder /app/dist ./dist
```

### Unnecessary Files in Runtime

```dockerfile
# BAD - Copies everything
COPY --from=builder /app ./

# GOOD - Explicit needed files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
```

## Debugging Multi-Stage Builds

**View intermediate stages:**
```bash
# Build and stop at specific stage
docker build --target builder -t myapp:builder .

# Run intermediate stage
docker run -it myapp:builder /bin/sh
```

**Check stage sizes:**
```bash
# Build with BuildKit output
DOCKER_BUILDKIT=1 docker build --progress=plain .
```

## References

- [Docker Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Advanced Dockerfiles](https://www.docker.com/blog/advanced-dockerfiles-faster-builds-and-smaller-images-using-buildkit-and-multistage-builds/)
