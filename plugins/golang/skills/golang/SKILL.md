---
name: golang
description: Setup, audit, and modernize Go projects with 2025 best practices. Startup-friendly with two tiers - quick start (5 minutes, minimal friction) or full setup (production-ready). Use when creating new Go projects or improving existing ones.
---

# Go Project Setup & Audit

## Philosophy

**Fast by default, comprehensive when needed.**

Most Go projects start as a single `main.go`. That's fine. Add structure when you feel pain, not before. This skill offers two tiers:

| Tier | When | Time | Linters |
|------|------|------|---------|
| Quick Start | New idea, CLI tool, prototype | 2 min | 5 essential |
| Full Setup | Growing codebase, team project | 10 min | 40+ comprehensive |

**Start with Quick Start. Graduate to Full Setup when:**
- Multiple people contributing
- Codebase exceeds ~5k lines
- You're shipping to production users

## When to Use

- "Create a new Go project"
- "Set up a Go CLI/API/library"
- "Audit this Go project"
- "Add linting to my Go project"

## Quick Start (Recommended for New Projects)

**5 steps, 2 minutes, ready to code:**

### 1. Initialize

```bash
mkdir myproject && cd myproject
go mod init github.com/yourorg/myproject
```

### 2. Add Essential Tooling

```bash
go get -tool github.com/golangci/golangci-lint/v2/cmd/golangci-lint@latest
go install github.com/air-verse/air@latest  # Hot reload
```

### 3. Copy Minimal Configs

Copy from `assets/` to project root:
- `.golangci.minimal.yml` → `.golangci.yml`
- `Makefile.minimal` → `Makefile`
- `.gitignore`
- `air.toml` (optional, for hot reload)

**Update local-prefixes** in `.golangci.yml` to your module path.

### 4. Create Entry Point

```go
// main.go
package main

import (
    "log/slog"
    "os"
)

func main() {
    if err := run(); err != nil {
        slog.Error("fatal", "error", err)
        os.Exit(1)
    }
}

func run() error {
    slog.Info("starting")
    // Your code here
    return nil
}
```

### 5. Verify

```bash
make lint  # Should pass
make test  # Should pass (no tests yet is fine)
make dev   # Hot reload running
```

**Done. Start coding.**

## Full Setup (Growing Projects)

When Quick Start isn't enough, upgrade:

### Structure Upgrade

```bash
mkdir -p cmd/myproject internal/{handler,service,config}
mv main.go cmd/myproject/
```

See `references/structure.md` for when each directory makes sense.

### Linter Upgrade

Replace `.golangci.yml` with `assets/.golangci.yml` (full config).

### Build Upgrade

Replace `Makefile` with `assets/Makefile` (or `Taskfile.yml`).

## Audit Mode

For existing projects, check these in order:

### Critical (Fix Now)

| Check | Command | Fix |
|-------|---------|-----|
| No linting | `ls .golangci.yml` | Add config from assets/ |
| Errors ignored | `grep -r "err :=" \| grep -v "if err"` | Handle or explicitly ignore |
| No tests | `find . -name "*_test.go"` | Add tests for critical paths |

### Important (Fix Soon)

| Check | Issue | Fix |
|-------|-------|-----|
| go.mod version | `< go 1.22` | Update, get loop variable fix |
| tools.go exists | Pre-1.24 pattern | Migrate to `tool` directive |
| Bare error returns | `return err` with no context | Wrap: `fmt.Errorf("op: %w", err)` |
| Using `log` package | No structure | Switch to `slog` |

### Nice to Have

| Check | Fix |
|-------|-----|
| No Makefile | Add from assets/ |
| No .gitignore | Add from assets/ |
| Flat structure at >3k LOC | Consider cmd/internal/ |

## Quick Reference

| Need | Reference |
|------|-----------|
| "Should I add internal/?" | `references/structure.md` |
| "What linters matter?" | `references/linting.md` |
| "How to wrap errors?" | `references/errors.md` |
| "Testing patterns?" | `references/testing.md` |
| "What's new in Go 1.25?" | `references/go-1.25.md` |

## Decision Shortcuts

**Web framework?**
- stdlib `net/http` + `chi` router (simple, idiomatic)
- Skip frameworks until you outgrow chi

**Database?**
- `sqlc` (type-safe, generates code from SQL)
- `sqlx` if you want more flexibility

**Config?**
- `os.Getenv()` + `.env` file for dev
- `envconfig` if you need struct binding

**Logging?**
- `slog` (stdlib, structured, fast enough)

## Assets Summary

| File | Purpose | When |
|------|---------|------|
| `.golangci.minimal.yml` | 5 essential linters | Quick Start |
| `.golangci.yml` | 40+ linters | Full Setup |
| `Makefile.minimal` | run/test/lint/dev | Quick Start |
| `Makefile` | All targets | Full Setup |
| `Taskfile.yml` | YAML alternative | Preference |
| `.gitignore` | Standard ignores | Always |
| `air.toml` | Hot reload config | Development |

## Anti-Patterns (Don't Do These)

| Mistake | Why | Do Instead |
|---------|-----|------------|
| Create cmd/internal/pkg day 1 | Over-engineering | Start flat |
| Enable all linters immediately | Friction kills velocity | Start with 5 |
| Custom error types early | YAGNI | Use fmt.Errorf |
| Global logger | Hard to test | Inject via struct/context |
| `tools.go` file | Outdated (pre-Go 1.24) | Use `tool` directive |

## The Only Rules

1. **Don't ignore errors** - Handle or explicitly `_ = fn()`
2. **Wrap with context** - `fmt.Errorf("operation: %w", err)`
3. **Run the linter** - `make lint` before commit
4. **Write some tests** - At least for the tricky parts

Everything else is optional until it isn't.

## Containerization

### Cross-Compilation (Recommended on Apple Silicon)

Go's built-in cross-compilation is simpler and more reliable than Docker multi-stage builds on Apple Silicon:

```bash
# Build for Linux from Mac
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w" -o app-linux-amd64 .

# Build for multiple platforms
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o app-amd64 .
GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -o app-arm64 .
```

**Why native cross-compilation?**
- Docker buildx QEMU emulation segfaults with Go 1.24+ on Apple Silicon
- Go's cross-compiler is fast and reliable
- No Docker needed for the compilation step

### Dockerfile Pattern (Pre-Built Binary)

```dockerfile
FROM alpine:latest
WORKDIR /app
COPY app-linux-amd64 ./app
RUN chmod +x ./app && addgroup -S app && adduser -S app -G app
USER app
CMD ["./app"]
```

**Build and push:**
```bash
docker buildx build --platform linux/amd64 -t myregistry/myapp:latest --push .
```

### When to Use Multi-Stage Builds

Multi-stage Docker builds (compile inside Docker) still work for:
- CI/CD on Linux runners
- ARM64-to-ARM64 builds on Apple Silicon
- When you need reproducible builds without local Go installation

**But avoid** multi-stage with `--platform linux/amd64` on Apple Silicon Macs.

## Version Info

- **Go**: 1.25 (latest stable)
- **golangci-lint**: v2.8+ (uses formatters section for goimports)
- **Skill Updated**: January 2026
