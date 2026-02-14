---
name: docker
description: Docker guidance for fast-moving teams. Starts with "do you need a Dockerfile?" (often no - use mounted code pattern). When Dockerfiles are needed, provides 2025 best practices for multi-stage builds, security hardening, BuildKit optimization, and language-specific patterns. Use when setting up Docker for a project, auditing Dockerfiles, or optimizing builds/images.
---

# Docker Best Practices (2025)

## First Question: Do You Need a Dockerfile?

For fast-moving projects, **the fastest Docker setup has no Dockerfile at all**.

```
Do you need a Dockerfile?
│
├─ Deploying to your own swarm/server?
│  └─ NO - Use mounted code pattern (see below)
│
├─ Publishing to Docker Hub / registry?
│  └─ YES - Others need to build your image
│
├─ CI/CD building images?
│  └─ YES - Need reproducible builds
│
├─ Complex native dependencies?
│  └─ MAYBE - If mount + base image isn't enough
│
├─ Open source project?
│  └─ YES - Contributors need to build/run
│
└─ Just deploying your own code?
   └─ NO - Mount it, move fast
```

## Fast Path: Mounted Code Pattern

**Build locally, mount into runtime container.** No Dockerfile, no registry, instant deploys.

```yaml
# docker-compose.yaml - the "no Dockerfile" approach
services:
  app:
    image: node:22-slim
    working_dir: /app
    volumes:
      - /absolute/path/to/project:/app:ro
    command: node dist/index.js
    environment:
      - NODE_ENV=production
```

**Why this works:**
- `pnpm build` locally → mount `dist/` into container
- Code changes = rebuild + restart (no image rebuild)
- Base images updated by just pulling latest
- Perfect for internal services, hobby projects, fast iteration

**When to graduate to Dockerfiles:**
- Image size matters (multi-stage shrinks significantly)
- Need CI/CD to build images
- Publishing for others to use
- Native dependencies that need build-time compilation

---

## When You DO Need a Dockerfile

### Required Reading by Topic

**⚠️ BEFORE providing Dockerfile guidance, read the relevant reference:**

| If user needs... | Read FIRST |
|------------------|------------|
| Multi-stage builds | `references/multi-stage-patterns.md` |
| BuildKit features (cache mounts, secrets) | `references/buildkit-features.md` |
| Base image selection | `references/base-images.md` |
| Language-specific patterns | `references/language-patterns.md` |
| Security hardening | `references/security-hardening.md` |

Skipping references leads to outdated patterns. Docker best practices change frequently.

### 5-Minute Essentials (Always Do These)

These take 5 minutes and prevent 80% of problems:

#### 1. Pin your base image (30 sec)
```dockerfile
# BAD
FROM node:latest

# GOOD
FROM node:22-slim
```

#### 2. Add .dockerignore (2 min)
```
.git
node_modules
dist
.env*
*.log
```
**Copy template:** `assets/dockerignore.template`

#### 3. Non-root user (2 min)
```dockerfile
# Add before final CMD
RUN groupadd -r app && useradd -r -g app app
USER app
```

#### 4. Order layers correctly (30 sec)
```dockerfile
# Dependencies first (cached)
COPY package*.json ./
RUN npm ci

# Code last (changes often)
COPY . .
```

**That's it for fast-moving projects.** Everything below is for when you need to optimize further.

---

## Comprehensive Optimization (When Publishing/Scaling)

### Multi-Stage Builds

Separate build-time from runtime for smaller images:

```dockerfile
# syntax=docker/dockerfile:1

FROM node:22 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim AS production
WORKDIR /app
RUN groupadd -r app && useradd -r -g app app
COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
USER app
CMD ["node", "dist/index.js"]
```

**→ See**: `references/multi-stage-patterns.md` for advanced patterns

### BuildKit Cache Mounts

Speed up dependency installation:

```dockerfile
# syntax=docker/dockerfile:1
RUN --mount=type=cache,target=/root/.npm npm ci
```

**→ See**: `references/buildkit-features.md` for cache mounts, secrets, COPY --link

### Base Image Selection

| Need | Image | Size |
|------|-------|------|
| Node.js | `node:22-slim` | ~200MB |
| Python | `python:3.12-slim` | ~150MB |
| Go | `scratch` or `gcr.io/distroless/static` | ~2MB |
| Maximum security | `gcr.io/distroless/*` | 2-20MB |

> **Apple Silicon Limitation:** Multi-stage Go builds with `docker buildx --platform linux/amd64` segfault on Apple Silicon Macs due to QEMU issues with Go 1.24+. Use native cross-compilation instead:
> ```bash
> GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o app .
> # Then use simple Dockerfile that just copies the binary
> ```
> See `assets/go-prebuilt.dockerfile` for the pattern.

**→ See**: `references/base-images.md` for detailed selection guide

### Language-Specific Templates

| Stack | Template | Key Feature |
|-------|----------|-------------|
| Node.js/pnpm | `assets/nodejs-pnpm.dockerfile` | Cache mounts, corepack |
| Go (multi-stage) | `assets/go-static.dockerfile` | Scratch/distroless, static binary |
| Go (pre-built) | `assets/go-prebuilt.dockerfile` | Apple Silicon compatible, native cross-compile |
| Python/uv | `assets/python-uv.dockerfile` | Modern uv package manager |
| Next.js | `assets/nextjs-standalone.dockerfile` | Standalone output mode |

**→ See**: `references/language-patterns.md` for detailed patterns

---

## Dockerfile Audit Checklist

When reviewing any Dockerfile:

### Must Fix (Security)
- [ ] Non-root USER instruction
- [ ] No secrets in ENV or COPY
- [ ] Pinned base image versions (no `:latest`)
- [ ] .dockerignore excludes .env, .git, secrets

### Should Fix (Size/Speed)
- [ ] Multi-stage separates build from runtime
- [ ] Layer order: deps first, code last
- [ ] Uses `*-slim` or smaller base

### Nice to Have
- [ ] BuildKit cache mounts
- [ ] COPY --link for multi-stage
- [ ] HEALTHCHECK defined
- [ ] OCI labels for metadata

---

## Quick Reference

### Common Anti-Patterns

```dockerfile
# BAD: Everything wrong
FROM node:latest
COPY . .
RUN npm install
ENV DATABASE_URL=postgres://secret
CMD ["npm", "start"]

# GOOD: Fixed
FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN groupadd -r app && useradd -r -g app app
USER app
CMD ["node", "dist/index.js"]
```

### Size Targets

| Type | Target | Excellent |
|------|--------|-----------|
| Go binary | < 20MB | < 10MB |
| Node.js API | < 200MB | < 100MB |
| Python API | < 200MB | < 100MB |

### Build Time Targets

| Change | Target |
|--------|--------|
| Code only | < 30s |
| Dependencies | < 2min |

---

## Integration with Swarm

If using Docker Swarm with Traefik:

**Mounted code (no Dockerfile):**
```yaml
services:
  app:
    image: node:22-slim
    volumes:
      - /absolute/path:/app:ro
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.myapp.rule=Host(`myapp.example.com`)"
```

**Built image (with Dockerfile):**
```yaml
services:
  app:
    image: myregistry/myapp:1.0.0
    deploy:
      labels:
        - "traefik.enable=true"
        # ...
```

---

## Decision Trees

### Creating New Project
```
Need Docker?
├─ Internal service, fast iteration → Mounted code, no Dockerfile
├─ Publishing to registry → Full Dockerfile (use templates)
├─ Open source → Full Dockerfile + clear build instructions
└─ Unsure → Start with mounted code, add Dockerfile later
```

### Auditing Existing Dockerfile
```
Priority order:
1. Security (non-root, no secrets) → Fix immediately
2. Base image (slim, pinned) → Quick win
3. .dockerignore → 5 minutes, big impact
4. Multi-stage → If image > 500MB
5. Cache mounts → If builds > 2min
```

---

## Navigation

| Topic | Reference |
|-------|-----------|
| Base image selection | `references/base-images.md` |
| Multi-stage patterns | `references/multi-stage-patterns.md` |
| Security hardening | `references/security-hardening.md` |
| BuildKit features | `references/buildkit-features.md` |
| Language patterns | `references/language-patterns.md` |

| Template | Use Case |
|----------|----------|
| `assets/nodejs-pnpm.dockerfile` | Node.js with pnpm |
| `assets/go-static.dockerfile` | Go to scratch |
| `assets/python-uv.dockerfile` | Python with uv |
| `assets/nextjs-standalone.dockerfile` | Next.js standalone |
| `assets/dockerignore.template` | Standard .dockerignore |

---

## Version Info

- **Last updated**: December 2025
- **Docker version**: 27.x+ (BuildKit default)
- **Philosophy**: Start simple, optimize when needed
- **Sources**: Docker docs, OWASP, Google Distroless
