# Base Image Selection Guide

## Decision Matrix

| Requirement | Recommended Base | Size | Trade-offs |
|-------------|------------------|------|------------|
| Go/Rust static binary | `scratch` | 0B | No shell, no debugging, no CA certs |
| Go/Rust with CA certs | `gcr.io/distroless/static-debian12` | ~2MB | No shell, includes CA certs + tzdata |
| Node.js production | `node:22-slim` | ~200MB | Has shell, minimal packages |
| Python production | `python:3.12-slim` | ~150MB | Has shell, minimal packages |
| Maximum security | `gcr.io/distroless/*` | 2-20MB | No shell/pkg manager, harder to debug |
| Need debugging | `*-slim` + debug tools | varies | Larger but debuggable |
| Alpine (caution) | `*-alpine` | ~5MB | musl libc can cause compatibility issues |

## Base Image Types

### scratch

Empty image - the smallest possible base.

```dockerfile
FROM scratch
COPY --from=builder /app /app
ENTRYPOINT ["/app"]
```

**Use when:**
- Go/Rust with `CGO_ENABLED=0` (static binary)
- You handle CA certs and tzdata yourself

**Limitations:**
- No shell, no debugging capability
- No `/etc/passwd`, `/etc/group`
- Must provide CA certs if making HTTPS calls

### Distroless (Google)

Minimal images with only language runtime. No shell, no package manager.

**Available images:**
| Image | Contents | Size |
|-------|----------|------|
| `gcr.io/distroless/static-debian12` | CA certs, tzdata, /etc/passwd | ~2MB |
| `gcr.io/distroless/base-debian12` | + glibc | ~20MB |
| `gcr.io/distroless/cc-debian12` | + libgcc | ~22MB |
| `gcr.io/distroless/nodejs22-debian12` | + Node.js 22 | ~130MB |
| `gcr.io/distroless/python3-debian12` | + Python 3 | ~50MB |

**Debug variants:** Add `:debug` tag for busybox shell (debugging only, not production).

```dockerfile
# Production
FROM gcr.io/distroless/static-debian12

# Debugging (temporary)
FROM gcr.io/distroless/static-debian12:debug
```

**Use when:**
- Maximum security required
- You don't need shell access in production
- Compliance requires minimal attack surface

### Slim Variants

Debian-based with minimal packages. Has shell and basic tools.

**Common slim images:**
- `node:22-slim` (~200MB)
- `python:3.12-slim` (~150MB)
- `ruby:3.3-slim` (~80MB)

```dockerfile
FROM node:22-slim
# Has bash, but not build-essential
```

**Use when:**
- Need shell for debugging
- Distroless doesn't have your runtime
- Need to install small additional packages

### Alpine

musl libc based, very small but potential compatibility issues.

```dockerfile
FROM node:22-alpine
```

**Size advantage:** ~5-10MB base vs ~100MB+ for debian-based

**Potential issues:**
- musl vs glibc incompatibility
- Some npm packages with native addons fail
- DNS resolution differs from glibc
- Slower Python due to musl

**Use when:**
- Size is critical AND you've tested thoroughly
- Go applications (no glibc dependency)
- Simple applications without native dependencies

### Docker Hardened Images (DHI) - 2025

As of December 2025, Docker released free hardened images:

```dockerfile
# When available, prefer DHI variants
FROM docker.io/library/node:22-slim-dhi
```

**Benefits:**
- 95% fewer CVEs than community images
- Complete SBOM included
- SLSA Build Level 3 provenance
- Automated security updates

## Size Comparison (Approximate)

| Base | Size | Security | Debuggability |
|------|------|----------|---------------|
| scratch | 0B | Excellent | None |
| distroless/static | 2MB | Excellent | None (debug tag available) |
| alpine | 5MB | Good | Limited |
| *-slim | 50-200MB | Good | Good |
| ubuntu/debian | 100-800MB | Fair | Excellent |

## Common Mistakes

### Using ubuntu:latest or debian:latest

```dockerfile
# BAD - 800MB+ with unnecessary packages
FROM ubuntu:latest

# GOOD - Use slim variants
FROM debian:bookworm-slim
```

### Using :latest Tags

```dockerfile
# BAD - Unpredictable, breaks reproducibility
FROM node:latest

# GOOD - Pin major.minor
FROM node:22-slim

# BETTER - Pin exact version for critical apps
FROM node:22.12.0-slim
```

### Using Alpine Without Testing

```dockerfile
# Risky if you haven't tested native dependencies
FROM node:22-alpine

# Safer default for Node.js
FROM node:22-slim
```

## Multi-Stage Base Image Strategy

Use different bases for build vs runtime:

```dockerfile
# Build stage - full tooling
FROM node:22 AS builder
# Has npm, node-gyp, build tools

# Runtime stage - minimal
FROM node:22-slim AS runtime
# Or even more minimal:
FROM gcr.io/distroless/nodejs22-debian12 AS runtime
```

## Updating Base Images

### Check for Updates

```bash
# Check current image
docker pull node:22-slim
docker images node:22-slim

# Scan for vulnerabilities
docker scout quickview node:22-slim
```

### Automated Updates

Consider tools like:
- Dependabot (GitHub)
- Renovate
- Watchtower (runtime updates - use with caution)

## References

- [Docker Official Images](https://hub.docker.com/search?image_filter=official)
- [Google Distroless](https://github.com/GoogleContainerTools/distroless)
- [Docker Hardened Images](https://www.docker.com/blog/docker-hardened-images-for-every-developer/)
