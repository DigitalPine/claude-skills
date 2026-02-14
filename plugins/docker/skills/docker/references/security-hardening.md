# Docker Security Hardening

## Security Layers

1. **Build-time** - What goes into the image
2. **Image-level** - Image configuration and permissions
3. **Runtime** - How container is executed

## Non-Root User (Critical)

**Default is root** - This is a major security risk.

### Creating and Using Non-Root User

```dockerfile
# Debian/Ubuntu
RUN groupadd --system --gid 1001 appgroup && \
    useradd --system --uid 1001 --gid appgroup appuser

# Alpine
RUN addgroup -S -g 1001 appgroup && \
    adduser -S -u 1001 -G appgroup appuser

# Switch to non-root
USER appuser
```

### Setting Ownership

```dockerfile
# Option 1: COPY with --chown
COPY --chown=appuser:appgroup ./dist /app/dist

# Option 2: Change ownership in RUN
RUN chown -R appuser:appgroup /app

# Option 3: From builder stage with ownership
COPY --from=builder --chown=appuser:appgroup /app/dist /app/dist
```

### Distroless Non-Root

Distroless images include a `nonroot` user:

```dockerfile
FROM gcr.io/distroless/static-debian12:nonroot
# UID 65532, already non-root
COPY --chown=65532:65532 ./app /app
```

## Minimal Base Images

**Attack surface reduction** - Fewer packages = fewer vulnerabilities.

| Image Type | Attack Surface | Recommendation |
|------------|---------------|----------------|
| ubuntu:latest | High | Avoid |
| debian:bookworm | Medium | Use slim variant |
| *-slim | Low | Good default |
| alpine | Lower | Test thoroughly |
| distroless | Minimal | Best for security |
| scratch | None | Best for static binaries |

## No Secrets in Layers

### Bad Practices

```dockerfile
# BAD - Secret in ENV (visible in image history)
ENV API_KEY=sk-secret123

# BAD - COPY secrets (persisted in layer)
COPY .env /app/.env

# BAD - Secret in build arg (visible in history)
ARG DATABASE_PASSWORD
RUN echo $DATABASE_PASSWORD > /config
```

### Good Practices

**BuildKit Secrets (build-time only):**
```dockerfile
# syntax=docker/dockerfile:1
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm install

# Build command:
# docker build --secret id=npmrc,src=.npmrc .
```

**Runtime secrets (environment variables):**
```dockerfile
# Don't set secrets at build time
# Inject at runtime via docker run -e or compose
```

**Docker secrets (Swarm/Compose):**
```yaml
# docker-compose.yml
services:
  app:
    secrets:
      - db_password
secrets:
  db_password:
    file: ./db_password.txt
```

## Read-Only Filesystem

Make container filesystem immutable:

```dockerfile
# Dockerfile - prepare for read-only
RUN mkdir -p /tmp /var/run && chmod 1777 /tmp
```

```bash
# Runtime
docker run --read-only --tmpfs /tmp myapp
```

```yaml
# docker-compose.yml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp
```

## Drop Capabilities

Containers inherit dangerous Linux capabilities by default.

```bash
# Drop all, add only needed
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE myapp
```

```yaml
# docker-compose.yml
services:
  app:
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE  # Only if binding to ports < 1024
```

**Common capabilities to drop:**
- `SYS_ADMIN` - Extremely dangerous
- `NET_RAW` - Packet sniffing
- `SYS_PTRACE` - Process debugging

## Security Scanning

### Docker Scout (Built-in)

```bash
# Quick vulnerability scan
docker scout quickview myapp:latest

# Detailed CVE report
docker scout cves myapp:latest

# Compare images
docker scout compare myapp:v1 myapp:v2
```

### Trivy

```bash
# Scan image
trivy image myapp:latest

# Scan with severity filter
trivy image --severity HIGH,CRITICAL myapp:latest
```

### Integrate in CI

```yaml
# GitHub Actions example
- name: Scan image
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: myapp:${{ github.sha }}
    exit-code: 1
    severity: CRITICAL,HIGH
```

## .dockerignore Security

Prevent sensitive files from entering build context:

```
# Secrets
.env
.env.*
*.pem
*.key
secrets/
credentials/

# Git (may contain sensitive history)
.git
.gitignore

# IDE (may contain project secrets)
.idea/
.vscode/

# Build artifacts
node_modules/
__pycache__/
```

## Image Signing and Verification

### Sign Images (Docker Content Trust)

```bash
export DOCKER_CONTENT_TRUST=1
docker push myregistry/myapp:1.0.0
```

### Cosign (Modern Approach)

```bash
# Sign
cosign sign myregistry/myapp:1.0.0

# Verify
cosign verify myregistry/myapp:1.0.0
```

## SBOM and Provenance (2025)

### Generate SBOM

```bash
docker buildx build --sbom=true -t myapp:1.0.0 .
```

### Generate Provenance

```bash
docker buildx build --provenance=true -t myapp:1.0.0 .
```

### Both (Recommended)

```bash
docker buildx build \
  --sbom=true \
  --provenance=true \
  -t myapp:1.0.0 .
```

## Rootless Docker

Run Docker daemon without root privileges:

```bash
# Install rootless Docker
dockerd-rootless-setuptool.sh install

# Use rootless Docker
export DOCKER_HOST=unix://$XDG_RUNTIME_DIR/docker.sock
```

**Benefits:**
- Daemon compromise doesn't give root access
- Container escape is limited to unprivileged user

## Runtime Security

### No --privileged

```bash
# NEVER in production
docker run --privileged myapp  # BAD

# Explicit capabilities instead
docker run --cap-add=SYS_PTRACE myapp  # If absolutely needed
```

### Resource Limits

```bash
docker run \
  --memory=512m \
  --cpus=1 \
  --pids-limit=100 \
  myapp
```

### Network Policies

```bash
# No network unless needed
docker run --network=none myapp

# Internal only
docker network create --internal isolated
docker run --network=isolated myapp
```

## Security Checklist

### Build-Time
- [ ] Use minimal base image (slim/distroless)
- [ ] Pin base image versions
- [ ] No secrets in ENV, ARG, or COPY
- [ ] Use BuildKit secrets for build-time secrets
- [ ] Comprehensive .dockerignore

### Image Configuration
- [ ] Non-root USER instruction
- [ ] Proper file ownership (--chown)
- [ ] No unnecessary packages
- [ ] HEALTHCHECK defined

### Runtime
- [ ] Drop all capabilities, add only needed
- [ ] Read-only filesystem where possible
- [ ] Resource limits set
- [ ] No --privileged flag
- [ ] Scan images before deployment

## References

- [OWASP Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
