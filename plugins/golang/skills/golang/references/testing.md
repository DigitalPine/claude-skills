# Go Testing Best Practices

## TL;DR

```go
func TestThing(t *testing.T) {
    tests := []struct {
        name    string
        input   string
        want    int
        wantErr bool
    }{
        {"valid", "hello", 5, false},
        {"empty", "", 0, true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := Thing(tt.input)
            if tt.wantErr {
                require.Error(t, err)
                return
            }
            require.NoError(t, err)
            assert.Equal(t, tt.want, got)
        })
    }
}
```

**Commands:**
```bash
go test ./...           # Run all
go test -race ./...     # With race detector
go test -cover ./...    # With coverage
```

**testify:** Use `require` (stops on fail) for preconditions, `assert` (continues) for checks.

---

## Philosophy

- **Test behavior, not implementation**
- **Table-driven tests are idiomatic**
- **Keep tests close to code** (same package or `_test` suffix)
- **Fast tests enable fast iteration**

## Table-Driven Tests

The Go idiom for testing multiple cases:

```go
func TestParseSize(t *testing.T) {
    tests := []struct {
        name    string
        input   string
        want    int64
        wantErr bool
    }{
        {
            name:  "bytes",
            input: "100",
            want:  100,
        },
        {
            name:  "kilobytes",
            input: "10KB",
            want:  10240,
        },
        {
            name:  "megabytes",
            input: "5MB",
            want:  5242880,
        },
        {
            name:    "invalid",
            input:   "abc",
            wantErr: true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := ParseSize(tt.input)

            if tt.wantErr {
                if err == nil {
                    t.Error("expected error, got nil")
                }
                return
            }

            if err != nil {
                t.Fatalf("unexpected error: %v", err)
            }
            if got != tt.want {
                t.Errorf("got %d, want %d", got, tt.want)
            }
        })
    }
}
```

### Parallel Table Tests

```go
func TestFetch(t *testing.T) {
    tests := []struct {
        name string
        url  string
        want int
    }{
        {"google", "https://google.com", 200},
        {"github", "https://github.com", 200},
    }

    for _, tt := range tests {
        tt := tt  // Not needed in Go 1.22+
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()  // Run subtests in parallel

            resp, err := http.Get(tt.url)
            if err != nil {
                t.Fatalf("fetch: %v", err)
            }
            defer resp.Body.Close()

            if resp.StatusCode != tt.want {
                t.Errorf("got %d, want %d", resp.StatusCode, tt.want)
            }
        })
    }
}
```

## Using testify

### require vs assert

```go
import (
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestUser(t *testing.T) {
    user, err := GetUser("123")

    // require: stops test on failure (use for preconditions)
    require.NoError(t, err)
    require.NotNil(t, user)

    // assert: continues test on failure (use for multiple checks)
    assert.Equal(t, "John", user.Name)
    assert.Equal(t, "john@example.com", user.Email)
    assert.True(t, user.Active)
}
```

**Rule**: Use `require` for things that would cause subsequent code to panic. Use `assert` when you want to see all failures.

### Common Assertions

```go
// Equality
assert.Equal(t, expected, actual)
assert.NotEqual(t, unexpected, actual)

// Nil checks
assert.Nil(t, err)
assert.NotNil(t, result)
require.NoError(t, err)  // Better for errors

// Boolean
assert.True(t, condition)
assert.False(t, condition)

// Collections
assert.Len(t, slice, 3)
assert.Contains(t, slice, item)
assert.Empty(t, slice)

// Errors
assert.Error(t, err)
assert.ErrorIs(t, err, ErrNotFound)
assert.ErrorContains(t, err, "not found")

// Comparisons
assert.Greater(t, 5, 3)
assert.Less(t, 3, 5)

// With message
assert.Equal(t, expected, actual, "user ID should match")
```

## Test Organization

### File Naming

```
user.go           # Implementation
user_test.go      # Unit tests (same package)
user_internal_test.go  # Internal tests (same package)
```

### Package Naming

```go
// Same package - access internals
package user

// External package - test public API only
package user_test
```

### Test Helpers

```go
// t.Helper() marks functions as test helpers
// Failure line numbers point to caller, not helper

func setupTestDB(t *testing.T) *sql.DB {
    t.Helper()

    db, err := sql.Open("sqlite3", ":memory:")
    if err != nil {
        t.Fatalf("open db: %v", err)
    }

    t.Cleanup(func() {
        db.Close()
    })

    return db
}

func TestUserRepo(t *testing.T) {
    db := setupTestDB(t)  // Cleanup runs automatically
    repo := NewUserRepo(db)
    // ...
}
```

## Mocking

### Interface-Based Mocking

```go
// Define interface for dependencies
type UserStore interface {
    Get(ctx context.Context, id string) (*User, error)
    Save(ctx context.Context, user *User) error
}

// Production implementation
type PostgresUserStore struct { ... }

// Test mock
type MockUserStore struct {
    GetFunc  func(ctx context.Context, id string) (*User, error)
    SaveFunc func(ctx context.Context, user *User) error
}

func (m *MockUserStore) Get(ctx context.Context, id string) (*User, error) {
    return m.GetFunc(ctx, id)
}

func (m *MockUserStore) Save(ctx context.Context, user *User) error {
    return m.SaveFunc(ctx, user)
}

// Usage in tests
func TestUserService(t *testing.T) {
    store := &MockUserStore{
        GetFunc: func(ctx context.Context, id string) (*User, error) {
            return &User{ID: id, Name: "Test"}, nil
        },
    }

    svc := NewUserService(store)
    user, err := svc.GetUser(context.Background(), "123")

    require.NoError(t, err)
    assert.Equal(t, "Test", user.Name)
}
```

### Using testify/mock

```go
import "github.com/stretchr/testify/mock"

type MockUserStore struct {
    mock.Mock
}

func (m *MockUserStore) Get(ctx context.Context, id string) (*User, error) {
    args := m.Called(ctx, id)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*User), args.Error(1)
}

func TestWithMock(t *testing.T) {
    store := new(MockUserStore)
    store.On("Get", mock.Anything, "123").Return(&User{Name: "Test"}, nil)

    svc := NewUserService(store)
    user, _ := svc.GetUser(context.Background(), "123")

    assert.Equal(t, "Test", user.Name)
    store.AssertExpectations(t)
}
```

## Testing HTTP

### Handler Testing

```go
func TestHealthHandler(t *testing.T) {
    req := httptest.NewRequest("GET", "/health", nil)
    w := httptest.NewRecorder()

    HealthHandler(w, req)

    resp := w.Result()
    assert.Equal(t, http.StatusOK, resp.StatusCode)

    body, _ := io.ReadAll(resp.Body)
    assert.Contains(t, string(body), "ok")
}
```

### Server Testing

```go
func TestAPI(t *testing.T) {
    srv := httptest.NewServer(NewRouter())
    defer srv.Close()

    resp, err := http.Get(srv.URL + "/api/users")
    require.NoError(t, err)
    defer resp.Body.Close()

    assert.Equal(t, http.StatusOK, resp.StatusCode)
}
```

## Benchmarks

### Basic Benchmark

```go
func BenchmarkParseSize(b *testing.B) {
    for b.Loop() {  // Go 1.24+
        ParseSize("100MB")
    }
}

// Pre-1.24 style
func BenchmarkParseSizeLegacy(b *testing.B) {
    for i := 0; i < b.N; i++ {
        ParseSize("100MB")
    }
}
```

### Table-Driven Benchmarks

```go
func BenchmarkHash(b *testing.B) {
    sizes := []int{64, 256, 1024, 4096}

    for _, size := range sizes {
        data := make([]byte, size)
        b.Run(fmt.Sprintf("size-%d", size), func(b *testing.B) {
            for b.Loop() {
                sha256.Sum256(data)
            }
        })
    }
}
```

## Running Tests

```bash
# All tests
go test ./...

# Verbose
go test -v ./...

# Specific test
go test -run TestParseSize ./...

# With race detector
go test -race ./...

# Coverage
go test -cover ./...
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out

# Benchmarks
go test -bench=. ./...
go test -bench=BenchmarkParseSize -benchmem ./...

# Short tests only (skip slow/integration)
go test -short ./...
```

## Test Flags in Code

```go
func TestIntegration(t *testing.T) {
    if testing.Short() {
        t.Skip("skipping integration test in short mode")
    }
    // ... slow integration test
}
```

## Golden Files

For testing complex output:

```go
func TestRender(t *testing.T) {
    output := Render(input)

    golden := filepath.Join("testdata", t.Name()+".golden")

    if *update {  // -update flag
        os.WriteFile(golden, []byte(output), 0644)
    }

    expected, _ := os.ReadFile(golden)
    assert.Equal(t, string(expected), output)
}
```

## Common Anti-Patterns

```go
// BAD - testing implementation details
func TestUserService(t *testing.T) {
    // Testing that specific internal method was called
}

// GOOD - testing behavior
func TestUserService(t *testing.T) {
    // Testing that the right result is returned
}

// BAD - sleeping in tests
time.Sleep(100 * time.Millisecond)

// GOOD - use channels/conditions
select {
case <-done:
case <-time.After(time.Second):
    t.Fatal("timeout")
}

// BAD - global state between tests
var globalDB *sql.DB

// GOOD - setup per test
func TestX(t *testing.T) {
    db := setupTestDB(t)
    // ...
}
```
