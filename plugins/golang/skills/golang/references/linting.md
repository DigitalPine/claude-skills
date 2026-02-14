# golangci-lint Configuration

## TL;DR

**Quick Start (5 linters):** errcheck, govet, staticcheck, gosec, unused

**Full Setup (40+ linters):** Use `assets/.golangci.yml`

**Commands:**
```bash
go get -tool github.com/golangci/golangci-lint/cmd/golangci-lint@latest
go tool golangci-lint run      # Check
go tool golangci-lint run --fix # Auto-fix
```

---

## Version Context

**golangci-lint v2** was released March 2025 with breaking changes:
- New configuration structure
- `linters.default` replaces `enable-all`/`disable-all`
- Settings moved under `linters.settings`
- New `golangci-lint fmt` command
- Exclusion presets instead of default exclusions

Run `golangci-lint migrate` to convert v1 configs to v2.

## Quick Setup

```bash
# Install (Go 1.24+ with tool directive)
go get -tool github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Or standalone
curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin

# Run
go tool golangci-lint run    # Go 1.24+
golangci-lint run            # Standalone
```

## Configuration File

golangci-lint looks for (in order):
1. `.golangci.yml` / `.golangci.yaml`
2. `.golangci.toml`
3. `.golangci.json`

Place at project root.

## Recommended Configuration (v2)

The provided `assets/.golangci.yml` is a production-ready config based on the community "golden config" with startup-appropriate strictness.

### Critical Settings to Customize

```yaml
formatters:
  settings:
    goimports:
      local-prefixes:
        - github.com/yourorg/yourproject  # CHANGE THIS
```

### Linter Categories

**Enabled by default** (our config):

| Category | Linters | Purpose |
|----------|---------|---------|
| Bugs | errcheck, staticcheck, govet | Catch common bugs |
| Security | gosec | Security issues |
| Performance | bodyclose, perfsprint | Performance pitfalls |
| Style | gofmt, revive, gocritic | Code style |
| Errors | errorlint, nilerr | Error handling |
| Complexity | cyclop, gocognit, funlen | Keep code simple |

**Intentionally strict** (may need tuning):

| Linter | What it catches | Tune if |
|--------|-----------------|---------|
| funlen | Functions >100 lines | Legitimate long functions |
| gocognit | Complexity >20 | Complex but clear code |
| dupl | Duplicate code | Intentional duplication |
| gochecknoglobals | Global vars | Legitimate globals |

## Common Exclusions

### Test Files

Tests often need different rules:

```yaml
linters:
  exclusions:
    rules:
      - path: '_test\.go'
        linters:
          - funlen      # Test functions can be long
          - dupl        # Test cases often similar
          - gosec       # Test data isn't sensitive
          - errcheck    # Less critical in tests
```

### Generated Code

```yaml
linters:
  exclusions:
    rules:
      - path: '\.pb\.go$'     # Protobuf
        linters: [all]
      - path: '_gen\.go$'     # Code generators
        linters: [all]
      - path: 'mock_.*\.go$'  # Mocks
        linters: [all]
```

### Legacy Code Migration

When migrating, start permissive and tighten:

```yaml
linters:
  exclusions:
    rules:
      # TODO: Fix these and remove exclusion
      - path: 'internal/legacy/'
        linters:
          - errorlint
          - gocritic
```

## Exclusion Presets

v2 has built-in presets (enabled in our config):

```yaml
linters:
  exclusions:
    presets:
      - std-error-handling     # errors.Is patterns
      - common-false-positives # Known FPs
```

## Key Linter Explanations

### errcheck

Ensures all errors are handled:

```go
// BAD - error ignored
file.Close()

// GOOD
if err := file.Close(); err != nil {
    return fmt.Errorf("close file: %w", err)
}

// OK - explicitly ignored
_ = file.Close()
```

### errorlint

Ensures proper error comparison:

```go
// BAD - direct comparison breaks with wrapping
if err == ErrNotFound { }

// GOOD - works with wrapped errors
if errors.Is(err, ErrNotFound) { }
```

### gosec

Security-focused checks:

```go
// FLAGGED - SQL injection risk
db.Query("SELECT * FROM users WHERE id = " + id)

// GOOD - parameterized
db.Query("SELECT * FROM users WHERE id = ?", id)
```

### revive

Style and best practices:

```go
// FLAGGED - unexported return type
func NewService() *service { }

// GOOD - exported type or interface
func NewService() Service { }
```

### staticcheck

Advanced static analysis:

```go
// FLAGGED - deprecated function
strings.Title("hello")

// GOOD - use cases.Title
cases.Title(language.English).String("hello")
```

## Running Linters

```bash
# Full run
golangci-lint run

# Specific packages
golangci-lint run ./internal/...

# Fast run (subset of linters)
golangci-lint run --fast

# Auto-fix what's possible
golangci-lint run --fix

# New in v2: format code
golangci-lint fmt
```

## CI Integration

```yaml
# GitHub Actions
- name: Lint
  uses: golangci/golangci-lint-action@v6
  with:
    version: latest
```

## Troubleshooting

### "deadline exceeded"

```bash
# Increase timeout
golangci-lint run --timeout 5m
```

### Too many issues initially

```bash
# Only new issues (for gradual adoption)
golangci-lint run --new-from-rev=HEAD~1

# Or baseline
golangci-lint run > baseline.txt
# Later
golangci-lint run --new-from-rev=$(git merge-base main HEAD)
```

### Specific linter fails

```bash
# Debug specific linter
golangci-lint run --disable-all --enable errcheck -v
```
