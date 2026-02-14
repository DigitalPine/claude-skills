# Go Project Structure

## TL;DR

- **Start flat** - `main.go` + `go.mod` is fine
- **Add internal/** when you have packages to hide
- **Add cmd/** when you have multiple binaries
- **Skip pkg/** unless you're building a public SDK
- **Never create util/, helpers/, models/, common/**

---

## Philosophy

**Start simple, add structure when pain emerges.** A flat layout is fine until:
- You have multiple binaries
- You need to hide implementation details
- You want to share code externally

## Layout Patterns

### Pattern 1: Flat (Small Projects)

```
myproject/
├── main.go          # Entry point
├── handler.go       # HTTP handlers
├── service.go       # Business logic
├── go.mod
└── go.sum
```

**Use when**: CLI tools, small utilities, learning projects, POCs.

**Grow to structured when**: You add a second binary or want private packages.

### Pattern 2: Standard (Most Projects)

```
myproject/
├── cmd/
│   └── api/
│       └── main.go      # Entry point (minimal)
├── internal/
│   ├── handler/         # HTTP handlers
│   ├── service/         # Business logic
│   ├── repository/      # Data access
│   └── config/          # Configuration
├── go.mod
├── go.sum
├── .golangci.yml
└── Makefile
```

**Use when**: Web services, APIs, anything beyond a single-file tool.

### Pattern 3: Full (Large Projects)

```
myproject/
├── cmd/
│   ├── api/main.go      # API server
│   ├── worker/main.go   # Background worker
│   └── cli/main.go      # CLI tool
├── internal/
│   ├── domain/          # Core business types
│   ├── handler/         # HTTP layer
│   ├── service/         # Business logic
│   ├── repository/      # Data access
│   └── config/
├── pkg/                 # Truly reusable, stable API
│   └── client/          # SDK for external users
├── api/
│   └── openapi.yaml     # API specification
├── scripts/             # Build/deploy scripts
├── go.mod
└── ...
```

**Use when**: Multi-binary projects, public SDKs, large teams.

## Directory Purposes

### cmd/

Entry points only. Each subdirectory = one binary.

```go
// cmd/api/main.go - Keep minimal!
package main

func main() {
    if err := run(); err != nil {
        slog.Error("fatal", "error", err)
        os.Exit(1)
    }
}

func run() error {
    // Wire dependencies, load config, start server
}
```

**Rule**: If cmd/api/main.go exceeds ~50 lines, move logic to internal/.

### internal/

Private packages. Go enforces: other modules cannot import from internal/.

```
internal/
├── handler/      # HTTP handlers (transport layer)
├── service/      # Business logic (application layer)
├── repository/   # Data access (infrastructure layer)
├── domain/       # Core types (domain layer)
└── config/       # Configuration loading
```

### pkg/

Public packages safe for external import. **Use sparingly.**

- Only create when you explicitly want external consumers
- Treat as a public API - breaking changes affect users
- Most projects don't need pkg/ at all

### api/

API definitions (OpenAPI, Protocol Buffers, GraphQL schemas).

```
api/
├── openapi.yaml
└── proto/
    └── service.proto
```

## Common Mistakes

### Mistake: Premature Structure

```
# DON'T start a new project like this:
myproject/
├── cmd/
├── internal/
│   ├── adapters/
│   ├── core/
│   │   ├── domain/
│   │   ├── ports/
│   │   └── services/
│   └── infrastructure/
└── pkg/
```

**Problem**: Over-engineering. You don't know what structure you need yet.

**Fix**: Start flat. Add directories as you feel pain.

### Mistake: Grab-bag Packages

```
# DON'T
internal/
├── utils/      # What's in here? Everything!
├── helpers/    # Same problem
├── common/     # Where things go to die
└── models/     # All types, unrelated
```

**Problem**: These packages grow unbounded and couple unrelated code.

**Fix**: Domain-specific packages. `internal/user/`, `internal/order/`, etc.

### Mistake: Over-layering

```
# DON'T (for a simple CRUD API)
internal/
├── controller/
│   └── user_controller.go
├── service/
│   └── user_service.go
├── repository/
│   └── user_repository.go
├── model/
│   └── user.go
└── dto/
    └── user_dto.go
```

**Problem**: 5 files for one entity. Indirection without value.

**Fix**: Flatten until you feel real pain from coupling.

## Package Naming

```go
// GOOD - lowercase, short, no underscores
package user
package httputil
package testhelper

// BAD
package userService     // No camelCase
package user_handler    // No underscores
package utils           // Too generic
```

## Import Organization

Standard order (goimports enforces this):

```go
import (
    // Standard library
    "context"
    "fmt"
    "net/http"

    // External packages
    "github.com/labstack/echo/v4"
    "go.uber.org/zap"

    // Internal packages (configure in golangci-lint)
    "github.com/myorg/myproject/internal/handler"
    "github.com/myorg/myproject/internal/service"
)
```

## Decision Guide

```
Q: Do I need cmd/?
A: Only if you have multiple binaries OR want clean separation.
   Single binary? main.go at root is fine.

Q: Do I need internal/?
A: Yes, once you have packages you don't want exported.
   Most projects benefit from internal/ early.

Q: Do I need pkg/?
A: Almost never. Only for explicit public APIs/SDKs.
   Default: put everything in internal/.

Q: How deep should packages nest?
A: Max 2 levels in internal/. Flat is usually better.
   internal/user/repository.go NOT internal/user/repository/postgres/client.go
```
