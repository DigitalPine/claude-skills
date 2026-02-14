# Vitest CLI Reference

Complete CLI command and option reference for Vitest 4.0+ (October 2025).

## Core Commands

### vitest

Start Vitest in the current directory:

```bash
vitest
```

**Behavior**:
- **Development**: Automatically enters watch mode
- **CI**: Runs tests once and exits (auto-detects CI environment)

**With filters**:

```bash
# Run only tests matching pattern
vitest foobar

# Run specific file
vitest src/components/Button.test.ts

# Run specific test line (filename:line syntax)
vitest src/utils/math.test.ts:42
```

### vitest run

Execute tests once without watch mode:

```bash
vitest run
```

**Use cases**:
- CI/CD pipelines
- Pre-commit hooks
- Manual test verification

### vitest watch

Force watch mode (synonymous with `vitest dev`):

```bash
vitest watch
```

Falls back to run mode in non-interactive environments.

### vitest related

Run tests covering specified source files:

```bash
vitest related src/utils/format.ts src/utils/parse.ts
```

**Common use case**: Integration with lint-staged:

```javascript
// .lintstagedrc.js
export default {
  '*.{js,ts}': 'vitest related --run'
}
```

**Requirements**:
- Must use `--run` flag for non-interactive environments
- Only runs tests that import the specified files

### vitest bench

Run benchmark tests only:

```bash
vitest bench
```

Executes files matching `**/*.bench.?(c|m)[jt]s?(x)` pattern.

### vitest init

Initialize project configuration:

```bash
vitest init browser
```

**Current support** (v4.0):
- `browser` - Set up browser mode configuration
- More init options may be added in future versions

**Note**: Limited scope currently; manual configuration often preferred for full control.

### vitest list

Display matching tests without running:

```bash
vitest list
```

**Options**:

```bash
# JSON output
vitest list --json

# Show only file names
vitest list --filesOnly

# With filters
vitest list --project unit
```

**Use cases**:
- Verify test discovery
- CI test splitting
- Debugging test patterns

## CLI Option Syntax

Vitest supports flexible option syntax:

### Camel Case / Kebab Case

```bash
vitest --passWithNoTests
vitest --pass-with-no-tests # Same as above
```

### Boolean Options

```bash
# Enable
vitest --coverage
vitest --coverage=true

# Disable
vitest --no-coverage
vitest --coverage=false
```

### Array Options

Repeat option for multiple values:

```bash
vitest --reporter=dot --reporter=json --reporter=html
```

### Nested Options

Use dot notation:

```bash
vitest --coverage.provider=v8
vitest --browser.headless=true
```

## Essential CLI Options

### Execution Control

#### -r, --root

Set project root directory:

```bash
vitest --root ./packages/core
```

#### -c, --config

Specify config file:

```bash
vitest --config vitest.config.prod.ts
```

#### --dir

Base directory for test scanning:

```bash
vitest --dir ./src
```

#### --run

Disable watch mode:

```bash
vitest --run
```

#### -w, --watch

Force watch mode:

```bash
vitest --watch
```

#### --isolate

Run each test file in isolation:

```bash
vitest --isolate        # Enable (default)
vitest --no-isolate     # Disable (faster but less safe)
```

### Test Filtering

#### -t, --testNamePattern

Filter tests by name pattern:

```bash
vitest -t "should validate"
vitest --testNamePattern="user.*login"
```

#### --project

Run specific projects:

```bash
vitest --project unit
vitest --project unit --project integration
```

#### --exclude

Additional glob patterns to exclude:

```bash
vitest --exclude "**/*.slow.test.ts"
```

#### --changed

Run tests for changed files (requires git):

```bash
vitest --changed
```

**Detects**:
- Uncommitted changes
- Changes since last commit

#### --shard

Divide tests for parallel CI execution:

```bash
# Run first shard of 3 total
vitest run --shard=1/3

# Run second shard of 3
vitest run --shard=2/3

# Run third shard of 3
vitest run --shard=3/3
```

**Use case**: Split tests across multiple CI workers.

### Performance & Concurrency

#### --maxWorkers

Limit concurrent workers:

```bash
vitest --maxWorkers=4
```

**Environment variable**: `VITEST_MAX_WORKERS`

#### --fileParallelism

Run test files in parallel:

```bash
vitest --fileParallelism       # Enable (default)
vitest --no-fileParallelism    # Disable (sequential)
```

#### --sequence.concurrent

Run tests within files in parallel:

```bash
vitest --sequence.concurrent
```

**Warning**: Tests must be independent to avoid race conditions.

#### --sequence.shuffle.files

Randomize test file order:

```bash
vitest --sequence.shuffle.files
```

#### --sequence.shuffle.tests

Randomize test order within files:

```bash
vitest --sequence.shuffle.tests
```

#### --sequence.seed

Set randomization seed:

```bash
vitest --sequence.seed=12345
```

Use for reproducible shuffled test runs.

### Coverage Options

#### --coverage.enabled

Enable coverage collection:

```bash
vitest run --coverage
# or
vitest run --coverage.enabled
```

#### --coverage.provider

Select coverage provider:

```bash
vitest run --coverage --coverage.provider=v8
vitest run --coverage --coverage.provider=istanbul
```

#### --coverage.reporter

Specify coverage formats:

```bash
vitest run --coverage --coverage.reporter=text --coverage.reporter=lcov
```

#### --coverage.reportsDirectory

Set coverage output directory:

```bash
vitest run --coverage --coverage.reportsDirectory=./test-coverage
```

#### --coverage.include

Define coverage scope (v4.0+ important):

```bash
vitest run --coverage --coverage.include="src/**/*.ts"
```

#### --coverage.exclude

Exclude patterns from coverage:

```bash
vitest run --coverage --coverage.exclude="**/*.test.ts"
```

### Browser Testing Options

#### --browser.enabled

Enable browser mode:

```bash
vitest --browser.enabled
```

#### --browser.name

Specify browser:

```bash
vitest --browser.name=chromium
vitest --browser.name=firefox
vitest --browser.name=webkit
```

**Available browsers depend on provider**.

#### --browser.headless

Run in headless mode:

```bash
vitest --browser.headless
```

**Essential for CI/CD**.

#### --browser.provider

Select browser provider:

```bash
vitest --browser.provider=playwright
```

**Note**: In v4.0+, config file should use object syntax with imports.

#### --browser.trace

Enable Playwright traces:

```bash
vitest --browser.trace=on
vitest --browser.trace=retain-on-failure
```

### Reporting & Output

#### --reporter

Specify test reporters:

```bash
vitest --reporter=verbose
vitest --reporter=dot --reporter=json
```

**Built-in reporters**:
- `default` - Tree view (default)
- `verbose` - Detailed output
- `dot` - Minimal dots
- `json` - JSON output
- `junit` - JUnit XML
- `tap` - TAP format
- `html` - HTML report

#### --outputFile

Write results to file:

```bash
vitest --reporter=json --outputFile=results.json
```

**Multiple reporters**:

```bash
vitest \
  --reporter=json --outputFile.json=results.json \
  --reporter=junit --outputFile.junit=junit.xml
```

#### --silent

Suppress console output:

```bash
vitest run --silent
```

#### --hideSkippedTests

Hide skipped test logs:

```bash
vitest --hideSkippedTests
```

#### --no-color

Remove console colors:

```bash
vitest --no-color
```

### Timeouts & Thresholds

#### --testTimeout

Test timeout in milliseconds:

```bash
vitest --testTimeout=10000  # 10 seconds
```

#### --hookTimeout

Setup/teardown hook timeout:

```bash
vitest --hookTimeout=15000  # 15 seconds
```

#### --slowTestThreshold

Mark tests as slow above threshold:

```bash
vitest --slowTestThreshold=1000  # 1 second
```

#### --bail

Stop after N failures:

```bash
vitest run --bail=1  # Stop on first failure
vitest run --bail=5  # Stop after 5 failures
```

### Snapshot Management

#### -u, --update

Update snapshots:

```bash
vitest -u
vitest --update
```

**Interactive watch mode**: Press `u` key to update snapshots.

### Debugging Options

#### --inspect

Enable Node.js inspector:

```bash
vitest --inspect
```

Then open `chrome://inspect` in Chrome.

#### --inspectBrk

Break before tests start:

```bash
vitest --inspectBrk
```

Useful for debugging specific test issues.

### UI & Visualization

#### --ui

Enable UI interface:

```bash
vitest --ui
```

**Requirements**: Install `@vitest/ui`:

```bash
pnpm add -D @vitest/ui
```

#### --open

Auto-open UI/coverage in browser:

```bash
vitest --ui --open
vitest run --coverage --open
```

### Type Checking

#### --typecheck.enabled

Enable type checking:

```bash
vitest --typecheck.enabled
```

#### --typecheck.checker

Select type checker:

```bash
vitest --typecheck.checker=tsc
vitest --typecheck.checker=vue-tsc
```

### Advanced Options

#### --merge-reports

Combine blob reports from directory:

```bash
vitest --merge-reports ./blob-reports
```

**Use case**: Combine sharded test results in CI.

#### --cache

Enable/disable result caching:

```bash
vitest --cache           # Enable (default)
vitest --no-cache        # Disable
```

#### --passWithNoTests

Don't fail when no tests found:

```bash
vitest run --passWithNoTests
```

#### --allowOnly

Allow `.only` in test files:

```bash
vitest --allowOnly
```

**Default**: `.only` causes failure in CI environments.

## Common Workflow Examples

### Local Development

```bash
# Watch mode with coverage
vitest --coverage

# Watch mode with UI
vitest --ui
```

### CI/CD Pipeline

```bash
# Basic CI run
vitest run --coverage

# With coverage and reporters
vitest run \
  --coverage \
  --reporter=default \
  --reporter=junit \
  --outputFile.junit=junit.xml

# Sharded execution (3 workers)
vitest run --shard=1/3  # Worker 1
vitest run --shard=2/3  # Worker 2
vitest run --shard=3/3  # Worker 3
```

### Pre-commit Hook

```bash
# Run tests for changed files
vitest related --run $(git diff --name-only HEAD)

# With lint-staged
# .lintstagedrc.js
export default {
  '*.{ts,tsx}': 'vitest related --run'
}
```

### Browser Testing

```bash
# Development
vitest --browser.enabled --browser.name=chromium

# CI
vitest run \
  --browser.enabled \
  --browser.headless \
  --browser.name=chromium
```

### Debugging

```bash
# Debug with inspector
vitest --inspect --no-file-parallelism

# Debug specific test
vitest src/utils/math.test.ts:42 --inspect-brk
```

### Type Checking

```bash
# Run tests with type checking
vitest --typecheck.enabled

# Type check only
vitest --typecheck.enabled --run --browser.enabled=false
```

## Watch Mode Commands

When in watch mode, these keyboard shortcuts are available:

- `a` - Re-run all tests
- `f` - Re-run only failed tests
- `u` - Update snapshots
- `p` - Filter by filename pattern
- `t` - Filter by test name pattern
- `q` - Quit watch mode
- `Enter` - Trigger test re-run

## Environment Variables

Set environment variables for Vitest behavior:

```bash
# Limit workers
VITEST_MAX_WORKERS=4 vitest

# Skip install checks
VITEST_SKIP_INSTALL_CHECKS=1 vitest

# Module directories
VITEST_MODULE_DIRECTORIES=node_modules,custom_modules vitest
```

## Configuration via CLI

Most config file options can be overridden via CLI:

```bash
vitest run \
  --globals \
  --environment=jsdom \
  --coverage.enabled \
  --coverage.provider=v8 \
  --coverage.include="src/**/*.ts" \
  --testTimeout=10000
```

**Precedence**: CLI > Config File > Defaults

## Help & Documentation

```bash
# Show all options
vitest --help

# Show version
vitest --version
```

## Common Patterns by Scenario

### Monorepo: Run specific package tests

```bash
vitest --project @mycompany/auth --project @mycompany/api
```

### CI: Fail-fast with coverage

```bash
vitest run --coverage --bail=1
```

### Development: Focus on specific area

```bash
vitest src/features/auth/**/*.test.ts --ui
```

### Performance testing: Sequential with profiling

```bash
vitest run --no-file-parallelism --reporter=verbose
```

### Visual regression: Browser with traces

```bash
vitest run \
  --browser.enabled \
  --browser.headless \
  --browser.trace=retain-on-failure
```
