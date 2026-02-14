# Go 1.25 Features

> Note: Go 1.25 builds on 1.24's features. This document covers the major additions from 1.24 that remain relevant.

## TL;DR

**Tool directive** (replaces tools.go):
```bash
go get -tool github.com/golangci/golangci-lint/v2/cmd/golangci-lint@latest
go tool golangci-lint run
```

**Benchmark loop** (cleaner):
```go
for b.Loop() { work() }  // Instead of: for i := 0; i < b.N; i++
```

**Generic type aliases** (now work):
```go
type Set[T comparable] = map[T]struct{}
```

---

## Tool Directive in go.mod

**The old way** (tools.go hack):
```go
//go:build tools

package tools

import (
    _ "github.com/golangci/golangci-lint/cmd/golangci-lint"
    _ "golang.org/x/tools/cmd/goimports"
)
```

**The new way** (Go 1.24+):
```
// go.mod
module github.com/yourorg/project

go 1.25

tool github.com/golangci/golangci-lint/v2/cmd/golangci-lint
```

### Tool Commands

```bash
# Add a tool (use v2 for golangci-lint)
go get -tool github.com/golangci/golangci-lint/v2/cmd/golangci-lint@latest

# Run a tool
go tool golangci-lint run

# Upgrade all tools
go get tool

# Install all tools to GOBIN
go install tool

# List tools
go list -m tool
```

### Benefits

1. **Explicit** - Tools clearly listed in go.mod
2. **Cached** - Executables cached in build cache (faster)
3. **No blank imports** - Cleaner than tools.go hack
4. **Easy updates** - `go get tool` upgrades everything

## Generic Type Aliases

Full support for parameterized type aliases:

```go
// Now works in Go 1.24
type Set[T comparable] = map[T]struct{}

type Result[T any] = struct {
    Value T
    Err   error
}

// Usage
var s Set[string] = make(Set[string])
s["hello"] = struct{}{}
```

## Benchmark Loop

Cleaner, less error-prone benchmark syntax:

```go
// Old way (still works)
func BenchmarkOld(b *testing.B) {
    for i := 0; i < b.N; i++ {
        doWork()
    }
}

// New way (Go 1.24)
func BenchmarkNew(b *testing.B) {
    for b.Loop() {
        doWork()
    }
}
```

`b.Loop()` handles:
- Iteration counting
- Prevents compiler optimizations that remove work
- Cleaner syntax

## os.Root (Filesystem Isolation)

Safely scope filesystem operations to a directory:

```go
root, err := os.OpenRoot("/var/data")
if err != nil {
    return err
}
defer root.Close()

// All operations scoped to /var/data
// Path traversal attacks prevented
f, err := root.Open("user/file.txt")  // OK
f, err := root.Open("../etc/passwd")   // Error: escapes root
```

### Use Cases

- Sandboxed file processing
- User upload handling
- Plugin/extension isolation
- Container-like restrictions

## runtime.AddCleanup

Better alternative to `runtime.SetFinalizer`:

```go
// Old way - error-prone
type Resource struct {
    handle *C.Handle
}

runtime.SetFinalizer(r, func(r *Resource) {
    C.close(r.handle)
})

// New way (Go 1.24) - cleaner, more flexible
r := &Resource{handle: C.open()}
runtime.AddCleanup(r, func(handle *C.Handle) {
    C.close(handle)
}, r.handle)
```

### Advantages

- Multiple cleanups per object
- Cleanup function doesn't receive object (prevents resurrection)
- More efficient
- Clearer semantics

## Swiss Tables Map Implementation

Internal change - maps are now faster:

- Based on Swiss Tables algorithm
- Better cache locality
- Faster lookups and iterations
- No API changes needed

## FIPS 140-3 Compliance

Built-in support for FIPS-compliant cryptography:

```go
import "crypto/tls/fipsonly"

// In your main.go or init
func init() {
    fipsonly.Enforce()
}
```

When enforced:
- Only FIPS-approved algorithms available
- Non-compliant operations fail
- No source code changes needed for most apps

## TLS Encrypted Client Hello (ECH)

Privacy enhancement - enabled by default:

```go
// Server-side: ECH automatically supported
srv := &http.Server{
    TLSConfig: &tls.Config{
        // ECH keys loaded automatically if configured
    },
}

// Post-quantum key exchange also enabled by default
// X25519MLKEM768 supported
```

## WebAssembly Improvements

### wasmexport Directive

Export Go functions to WASM host:

```go
//go:wasmexport add
func add(a, b int32) int32 {
    return a + b
}
```

### WASI Reactor Mode

Build Go as a WASI library (not just command):

```bash
GOOS=wasip1 GOARCH=wasm go build -buildmode=c-shared -o lib.wasm
```

## Migration Checklist

When updating a project to Go 1.25:

- [ ] Update go.mod: `go 1.25`
- [ ] Replace tools.go with tool directives
- [ ] Use golangci-lint v2 (goimports goes in formatters section, not linters)
- [ ] Update CI to use Go 1.25
- [ ] Consider using `b.Loop()` in benchmarks
- [ ] Review if `os.Root` applies to file handling
- [ ] Check if FIPS compliance is needed

## Compatibility

Go 1.25 maintains the Go 1 compatibility promise:
- Existing code continues to work
- No breaking changes to stable APIs
- New features are additions, not replacements

## Quick Reference

| Feature | Status | Impact |
|---------|--------|--------|
| Tool directive | Stable | Replace tools.go |
| Generic type aliases | Stable | New capability |
| b.Loop() | Stable | Cleaner benchmarks |
| os.Root | Stable | Safer file ops |
| runtime.AddCleanup | Stable | Better finalizers |
| Swiss Tables | Internal | Faster maps |
| FIPS 140-3 | Stable | Compliance option |
| ECH/post-quantum TLS | Default on | Privacy/security |
| WASM exports | Stable | Better WASM interop |
