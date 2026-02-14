# Language-Specific Docker Patterns

## Node.js

### Package Manager Comparison

| Manager | Speed | Disk Usage | Docker Recommendation |
|---------|-------|------------|----------------------|
| npm | Moderate | High | Use `npm ci` |
| pnpm | Fast | Low | Recommended |
| bun | Fastest | Low | Excellent for build, test Node runtime |
| yarn | Moderate | Moderate | Use `yarn install --frozen-lockfile` |

### Node.js with pnpm (Recommended)

```dockerfile
# syntax=docker/dockerfile:1

FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./

# Fetch packages (cached)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nodejs

# Copy only production deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

USER nodejs
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Node.js with Bun (Build) + Node (Runtime)

Use Bun's fast package management with Node.js runtime:

```dockerfile
# syntax=docker/dockerfile:1

FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM node:22-slim AS production
WORKDIR /app
ENV NODE_ENV=production

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nodejs

# Production deps only
COPY package.json bun.lockb ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

USER nodejs
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Next.js Standalone

Next.js can output a standalone build with minimal dependencies:

```dockerfile
# syntax=docker/dockerfile:1

FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM node:22-slim AS production
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nodejs

# Copy standalone build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/.next/static ./.next/static

USER nodejs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

**next.config.js requirement:**
```javascript
module.exports = {
  output: 'standalone',
}
```

## Go

### Static Binary to Scratch

Smallest possible Go container:

```dockerfile
# syntax=docker/dockerfile:1

FROM golang:1.23-alpine AS builder
WORKDIR /app

# Download dependencies (cached)
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

# Build static binary
COPY . .
RUN --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o server .

FROM scratch AS production
# CA certificates for HTTPS
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
# Timezone data (if needed)
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
# Binary
COPY --from=builder /app/server /server

EXPOSE 8080
ENTRYPOINT ["/server"]
```

**Build flags explained:**
- `CGO_ENABLED=0` - Produce static binary (no glibc dependency)
- `-ldflags="-s -w"` - Strip debug info (~30% smaller)
- `-a` - Rebuild all packages (optional, for clean builds)

### Go to Distroless

Slightly larger but includes passwd/group for USER:

```dockerfile
# syntax=docker/dockerfile:1

FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o server .

FROM gcr.io/distroless/static-debian12:nonroot AS production
COPY --from=builder /app/server /server
EXPOSE 8080
ENTRYPOINT ["/server"]
```

### Go with CGO

When CGO is required (e.g., SQLite):

```dockerfile
FROM golang:1.23 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o server .

FROM gcr.io/distroless/base-debian12 AS production
COPY --from=builder /app/server /server
ENTRYPOINT ["/server"]
```

## Python

### Python with uv (Modern, Fast)

uv is the modern Python package manager (2024+):

```dockerfile
# syntax=docker/dockerfile:1

FROM python:3.12-slim AS builder
WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Create venv and install deps
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev --no-install-project

# Install project
COPY . .
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

FROM python:3.12-slim AS production
WORKDIR /app

# Create non-root user
RUN groupadd --system --gid 1001 appgroup && \
    useradd --system --uid 1001 --gid appgroup appuser

# Copy venv from builder
COPY --from=builder --chown=appuser:appgroup /app/.venv /app/.venv
COPY --from=builder --chown=appuser:appgroup /app /app

ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

USER appuser
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Python with Poetry

```dockerfile
# syntax=docker/dockerfile:1

FROM python:3.12-slim AS builder
WORKDIR /app

ENV POETRY_HOME="/opt/poetry"
ENV POETRY_VENV="/opt/poetry-venv"
ENV POETRY_CACHE_DIR="/opt/.cache"
ENV POETRY_NO_INTERACTION=1
ENV POETRY_VIRTUALENVS_IN_PROJECT=true

# Install poetry
RUN python -m venv $POETRY_VENV && \
    $POETRY_VENV/bin/pip install -U pip setuptools && \
    $POETRY_VENV/bin/pip install poetry

ENV PATH="$POETRY_VENV/bin:$PATH"

# Install dependencies
COPY pyproject.toml poetry.lock ./
RUN --mount=type=cache,target=$POETRY_CACHE_DIR \
    poetry install --only=main --no-root

# Install project
COPY . .
RUN poetry install --only=main

FROM python:3.12-slim AS production
WORKDIR /app

RUN groupadd --system --gid 1001 appgroup && \
    useradd --system --uid 1001 --gid appgroup appuser

# Copy only venv (not poetry)
COPY --from=builder --chown=appuser:appgroup /app/.venv /app/.venv
COPY --from=builder --chown=appuser:appgroup /app /app

ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

USER appuser
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Python Environment Variables

Always set these for production:

```dockerfile
ENV PYTHONDONTWRITEBYTECODE=1  # Don't write .pyc files
ENV PYTHONUNBUFFERED=1          # Don't buffer stdout/stderr
ENV PYTHONFAULTHANDLER=1        # Better crash diagnostics
```

## Rust

### Rust to Scratch

```dockerfile
# syntax=docker/dockerfile:1

FROM rust:1.83-alpine AS builder
WORKDIR /app

# Install musl for static linking
RUN apk add --no-cache musl-dev

# Cache dependencies
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/app/target \
    cargo build --release && rm -rf src

# Build actual application
COPY . .
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/app/target \
    cargo build --release && \
    cp target/release/myapp /myapp

FROM scratch AS production
COPY --from=builder /myapp /myapp
EXPOSE 8080
ENTRYPOINT ["/myapp"]
```

## Java

### Java with jlink (Custom JRE)

```dockerfile
# syntax=docker/dockerfile:1

FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app

COPY . .
RUN ./gradlew build -x test

# Create minimal JRE
RUN jlink --add-modules java.base,java.logging \
    --strip-debug --no-header-files --no-man-pages \
    --compress=2 --output /jre

FROM debian:bookworm-slim AS production
WORKDIR /app

COPY --from=builder /jre /jre
COPY --from=builder /app/build/libs/*.jar app.jar

ENV JAVA_HOME=/jre
ENV PATH="$JAVA_HOME/bin:$PATH"

RUN groupadd --system --gid 1001 appgroup && \
    useradd --system --uid 1001 --gid appgroup appuser
USER appuser

EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

## Size Comparison

Typical image sizes with optimized Dockerfiles:

| Stack | Naive | Optimized | Target |
|-------|-------|-----------|--------|
| Go (scratch) | 800MB | 8-15MB | <20MB |
| Node.js API | 1GB+ | 150-200MB | <200MB |
| Python API | 1GB+ | 100-150MB | <200MB |
| Rust (scratch) | 1GB+ | 5-10MB | <15MB |
| Java (jlink) | 500MB+ | 100-150MB | <200MB |
| Next.js | 1GB+ | 100-150MB | <200MB |
