# Go Error Handling

## TL;DR

```go
// 1. Always handle errors
if err != nil {
    return fmt.Errorf("what failed: %w", err)  // Wrap with context
}

// 2. Check errors properly (works with wrapped errors)
if errors.Is(err, ErrNotFound) { }  // Sentinel errors
if errors.As(err, &myErr) { }       // Error types

// 3. Multiple errors (Go 1.20+)
return errors.Join(err1, err2)
```

**The run() pattern:**
```go
func main() {
    if err := run(); err != nil {
        slog.Error("fatal", "error", err)
        os.Exit(1)
    }
}
```

---

## Core Principles

1. **Errors are values** - returned and checked explicitly
2. **Add context when propagating** - wrap with information about what failed
3. **Handle or return** - never silently ignore
4. **Use errors.Is/As** - for checking error types (supports wrapping)

## Error Wrapping (fmt.Errorf + %w)

```go
// BAD - loses context
func GetUser(id string) (*User, error) {
    user, err := db.Find(id)
    if err != nil {
        return nil, err  // Which operation failed?
    }
    return user, nil
}

// GOOD - adds context
func GetUser(id string) (*User, error) {
    user, err := db.Find(id)
    if err != nil {
        return nil, fmt.Errorf("get user %s: %w", id, err)
    }
    return user, nil
}
```

**Result**: `get user abc123: record not found` vs just `record not found`

## Error Checking

### errors.Is (Go 1.13+)

For sentinel errors (predefined error values):

```go
var ErrNotFound = errors.New("not found")

// BAD - breaks with wrapped errors
if err == ErrNotFound { }

// GOOD - unwraps automatically
if errors.Is(err, ErrNotFound) { }

// Works with wrapped errors
wrapped := fmt.Errorf("user lookup: %w", ErrNotFound)
errors.Is(wrapped, ErrNotFound) // true
```

### errors.As (Go 1.13+)

For error types:

```go
type ValidationError struct {
    Field string
    Msg   string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("%s: %s", e.Field, e.Msg)
}

// BAD - type assertion breaks with wrapping
if ve, ok := err.(*ValidationError); ok { }

// GOOD - unwraps automatically
var ve *ValidationError
if errors.As(err, &ve) {
    log.Printf("validation failed: field=%s msg=%s", ve.Field, ve.Msg)
}
```

### errors.Join (Go 1.20+)

For multiple errors:

```go
func ValidateUser(u User) error {
    var errs []error

    if u.Email == "" {
        errs = append(errs, errors.New("email required"))
    }
    if u.Name == "" {
        errs = append(errs, errors.New("name required"))
    }

    return errors.Join(errs...)  // nil if empty
}
```

## Custom Error Types

### Simple Structured Error

```go
type AppError struct {
    Code    string // Machine-readable: "USER_NOT_FOUND"
    Message string // Human-readable: "User not found"
    Err     error  // Wrapped error
}

func (e *AppError) Error() string {
    if e.Err != nil {
        return fmt.Sprintf("%s: %s: %v", e.Code, e.Message, e.Err)
    }
    return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

func (e *AppError) Unwrap() error {
    return e.Err
}

// Usage
return &AppError{
    Code:    "DB_ERROR",
    Message: "failed to fetch user",
    Err:     err,
}
```

### HTTP-Aware Error

```go
type HTTPError struct {
    Status  int
    Code    string
    Message string
    Err     error
}

func (e *HTTPError) Error() string {
    return e.Message
}

func (e *HTTPError) Unwrap() error {
    return e.Err
}

// Sentinel errors
var (
    ErrNotFound = &HTTPError{Status: 404, Code: "NOT_FOUND", Message: "resource not found"}
    ErrForbidden = &HTTPError{Status: 403, Code: "FORBIDDEN", Message: "access denied"}
)

// Handler can check and respond appropriately
var httpErr *HTTPError
if errors.As(err, &httpErr) {
    w.WriteHeader(httpErr.Status)
    json.NewEncoder(w).Encode(map[string]string{
        "code":    httpErr.Code,
        "message": httpErr.Message,
    })
}
```

## Patterns

### The run() Pattern

Centralize error handling at the top:

```go
func main() {
    if err := run(); err != nil {
        slog.Error("fatal error", "error", err)
        os.Exit(1)
    }
}

func run() error {
    cfg, err := loadConfig()
    if err != nil {
        return fmt.Errorf("load config: %w", err)
    }

    db, err := connectDB(cfg.DatabaseURL)
    if err != nil {
        return fmt.Errorf("connect db: %w", err)
    }
    defer db.Close()

    return startServer(cfg, db)
}
```

### Defer with Error Handling

```go
func WriteFile(path string, data []byte) (err error) {
    f, err := os.Create(path)
    if err != nil {
        return fmt.Errorf("create file: %w", err)
    }
    defer func() {
        if cerr := f.Close(); cerr != nil && err == nil {
            err = fmt.Errorf("close file: %w", cerr)
        }
    }()

    if _, err := f.Write(data); err != nil {
        return fmt.Errorf("write file: %w", err)
    }
    return nil
}
```

### Error Groups (Concurrency)

```go
import "golang.org/x/sync/errgroup"

func FetchAll(ctx context.Context, urls []string) error {
    g, ctx := errgroup.WithContext(ctx)

    for _, url := range urls {
        url := url // Go 1.22+ doesn't need this
        g.Go(func() error {
            return fetch(ctx, url)
        })
    }

    return g.Wait()  // Returns first error, cancels others
}
```

## Anti-Patterns

### Bare Returns

```go
// BAD
if err != nil {
    return err  // No context
}

// GOOD
if err != nil {
    return fmt.Errorf("operation X: %w", err)
}
```

### Logging and Returning

```go
// BAD - error logged twice (here and by caller)
if err != nil {
    log.Printf("error: %v", err)
    return err
}

// GOOD - log OR return, not both
if err != nil {
    return fmt.Errorf("operation: %w", err)
}
// Let top-level handler log
```

### Over-wrapping

```go
// BAD - redundant context
return fmt.Errorf("GetUser error: %w",
    fmt.Errorf("database error: %w", err))

// GOOD - wrap once with useful context
return fmt.Errorf("get user %s: %w", userID, err)
```

### Ignoring Errors Silently

```go
// BAD
file.Close()  // Error ignored

// GOOD - explicit ignore if intentional
_ = file.Close()

// BETTER - handle if it matters
if err := file.Close(); err != nil {
    return fmt.Errorf("close file: %w", err)
}
```

## Logging Errors with slog

```go
// Structured error logging
if err != nil {
    slog.Error("failed to process request",
        "error", err,
        "user_id", userID,
        "request_id", requestID,
    )
    return err
}

// With error type info
var appErr *AppError
if errors.As(err, &appErr) {
    slog.Error("application error",
        "code", appErr.Code,
        "message", appErr.Message,
        "cause", appErr.Err,
    )
}
```

## Testing Errors

```go
func TestGetUser_NotFound(t *testing.T) {
    _, err := GetUser("nonexistent")

    // Check sentinel
    if !errors.Is(err, ErrNotFound) {
        t.Errorf("expected ErrNotFound, got %v", err)
    }

    // Check error type
    var httpErr *HTTPError
    if !errors.As(err, &httpErr) {
        t.Fatal("expected HTTPError")
    }
    if httpErr.Status != 404 {
        t.Errorf("expected 404, got %d", httpErr.Status)
    }
}
```
