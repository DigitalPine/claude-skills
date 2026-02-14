# BuildKit Features and Optimization

## BuildKit Overview

BuildKit is Docker's modern build engine, default since Docker 23.0.

**Key features:**
- Parallel stage execution
- Advanced caching (cache mounts, external caches)
- Secret management (never in layers)
- SSH forwarding for private repos
- Build attestations (SBOM, provenance)

**Enable explicitly (if needed):**
```bash
export DOCKER_BUILDKIT=1
# or
docker buildx build .
```

## Dockerfile Syntax Directive

Enable latest BuildKit features:

```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-slim
# ... rest of Dockerfile
```

**Version options:**
- `docker/dockerfile:1` - Latest stable 1.x
- `docker/dockerfile:1.7` - Specific version
- `docker/dockerfile:labs` - Experimental features

## Cache Mounts

Persist package manager caches across builds.

### npm/pnpm

```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-slim

RUN --mount=type=cache,target=/root/.npm \
    npm ci

# pnpm
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
```

### Go

```dockerfile
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build -o server .
```

### Python (pip/uv)

```dockerfile
# pip
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

# uv
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install -r requirements.txt
```

### apt

```dockerfile
RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt \
    apt-get update && apt-get install -y package
```

### Cache Options

```dockerfile
RUN --mount=type=cache,target=/cache,sharing=locked \
    # sharing=shared (default) - concurrent access
    # sharing=locked - exclusive access (safer)
    # sharing=private - per-build copy
```

## Secret Mounts

Pass secrets without persisting in layers:

```dockerfile
# syntax=docker/dockerfile:1

# Mount as file
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm install

# Mount as environment variable (BuildKit 0.15+)
RUN --mount=type=secret,id=api_key,env=API_KEY \
    ./download-artifacts.sh
```

**Build command:**
```bash
docker build --secret id=npmrc,src=.npmrc .
docker build --secret id=api_key,src=api_key.txt .
```

**From environment:**
```bash
docker build --secret id=api_key,env=API_KEY .
```

## SSH Forwarding

Access private repos during build:

```dockerfile
# syntax=docker/dockerfile:1

RUN --mount=type=ssh \
    git clone git@github.com:org/private-repo.git
```

**Build command:**
```bash
# Forward default SSH agent
docker build --ssh default .

# Forward specific key
docker build --ssh default=$HOME/.ssh/id_rsa .
```

## COPY --link

Create independent layers for better cache reuse:

```dockerfile
# Without --link: layer depends on all previous layers
COPY --from=builder /app/dist ./dist

# With --link: independent layer, better cache hits
COPY --link --from=builder /app/dist ./dist
```

**Benefits:**
- Layers can be rebased onto new base images
- Better cache hits with `--cache-from`
- No performance penalty

**Limitation:**
- Cannot follow symlinks in destination
- Use `--link` by default unless symlink following needed

## COPY --chmod

Set permissions without extra RUN layer:

```dockerfile
# Without --chmod (extra layer)
COPY script.sh /app/
RUN chmod +x /app/script.sh

# With --chmod (single layer)
COPY --chmod=755 script.sh /app/
```

**Supported formats:**
```dockerfile
COPY --chmod=755 ...      # Octal
COPY --chmod=0755 ...     # Octal with leading zero
# Non-octal (labs channel): COPY --chmod=u+x ...
```

## Layer Optimization

### Order by Change Frequency

Place rarely-changing instructions first:

```dockerfile
# 1. Base image (rarely changes)
FROM node:22-slim

# 2. System dependencies (occasionally changes)
RUN apt-get update && apt-get install -y dumb-init

# 3. Application dependencies (changes with package.json)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 4. Application code (changes frequently)
COPY . .

# 5. Build (depends on code)
RUN pnpm build
```

### Combine Related Commands

```dockerfile
# BAD - Multiple layers
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get clean

# GOOD - Single layer
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

### Use .dockerignore

Reduce build context size:

```
.git
node_modules
dist
*.log
.env*
```

**Check context size:**
```bash
# See what's sent to daemon
docker build . 2>&1 | grep "Sending build context"
```

## External Cache

Share cache between CI runs:

```bash
# Push cache to registry
docker buildx build \
  --cache-to type=registry,ref=myregistry/myapp:cache \
  --cache-from type=registry,ref=myregistry/myapp:cache \
  -t myapp:latest .

# Local cache directory
docker buildx build \
  --cache-to type=local,dest=/tmp/docker-cache \
  --cache-from type=local,src=/tmp/docker-cache \
  -t myapp:latest .
```

## Build Arguments

Pass values at build time:

```dockerfile
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-slim

ARG BUILD_ENV=production
ENV NODE_ENV=${BUILD_ENV}
```

**Built-in args (no declaration needed):**
- `TARGETPLATFORM` - e.g., linux/amd64
- `TARGETOS` - e.g., linux
- `TARGETARCH` - e.g., amd64
- `BUILDPLATFORM`, `BUILDOS`, `BUILDARCH`
- `TARGETSTAGE` - Name of target stage (BuildKit 0.15+)

## Multi-Platform Builds

Build for multiple architectures:

```bash
# Create builder with multi-platform support
docker buildx create --use --name multiplatform

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t myapp:latest \
  --push .
```

**In Dockerfile:**
```dockerfile
FROM --platform=$BUILDPLATFORM golang:1.23 AS builder
ARG TARGETOS TARGETARCH
RUN GOOS=$TARGETOS GOARCH=$TARGETARCH go build -o server .

FROM --platform=$TARGETPLATFORM gcr.io/distroless/static
COPY --from=builder /app/server /server
```

## Build Attestations

### SBOM (Software Bill of Materials)

```bash
docker buildx build --sbom=true -t myapp:1.0.0 .

# View SBOM
docker buildx imagetools inspect myapp:1.0.0 --format '{{json .SBOM}}'
```

### Provenance

```bash
docker buildx build --provenance=true -t myapp:1.0.0 .

# View provenance
docker buildx imagetools inspect myapp:1.0.0 --format '{{json .Provenance}}'
```

## Debugging Builds

### Show Build Progress

```bash
docker build --progress=plain .
```

### Build History (BuildKit 0.15+)

```bash
# List recent builds
docker buildx history

# Inspect specific build
docker buildx history inspect <build-id>
```

### Export Build Layers

```bash
docker build --output type=local,dest=./output .
docker build --output type=tar,dest=./output.tar .
```

## Performance Tips

1. **Use cache mounts** for package managers
2. **Order layers** by change frequency
3. **Use COPY --link** for multi-stage copies
4. **Parallelize stages** (BuildKit does this automatically)
5. **Use external cache** in CI
6. **Minimize build context** with .dockerignore
7. **Pin base images** to avoid unnecessary pulls

## References

- [Dockerfile Reference](https://docs.docker.com/reference/dockerfile/)
- [BuildKit GitHub](https://github.com/moby/buildkit)
- [Docker Build Cache](https://docs.docker.com/build/cache/)
