# Vitest Configuration Reference

Complete configuration reference for Vitest 4.0+ (October 2025).

## Configuration File Structure

Vitest reads configuration from `vite.config.ts` or a dedicated `vitest.config.ts` file. The dedicated config file takes priority and completely overrides Vite configuration.

### Basic Setup

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // All test options go here
  },
})
```

### With TypeScript in Vite Config

Add type reference at the top of `vite.config.ts`:

```typescript
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'

export default defineConfig({
  // Vite config
  test: {
    // Vitest config
  },
})
```

### Valid Config File Extensions

- `.js`, `.mjs`, `.cjs` - JavaScript configs
- `.ts`, `.mts`, `.cts` - TypeScript configs
- ❌ `.json` - NOT supported

## Core Configuration Options

### Test Discovery & Execution

#### include
**Type**: `string[]`
**Default**: `['**/*.{test,spec}.?(c|m)[jt]s?(x)']`

Glob patterns for test file discovery:

```typescript
include: [
  '**/*.test.ts',
  '**/__tests__/**/*.ts'
]
```

#### exclude
**Type**: `string[]`
**Default**: `['**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**', '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*']`

Patterns to exclude from test discovery:

```typescript
exclude: [
  '**/node_modules/**',
  '**/fixtures/**',
  '**/*.integration.test.ts' // if you want to run these separately
]
```

#### testTimeout
**Type**: `number`
**Default**: `5000` (Node.js), `15000` (Browser Mode)

Global timeout for tests in milliseconds:

```typescript
testTimeout: 10000 // 10 seconds
```

#### hookTimeout
**Type**: `number`
**Default**: `10000`

Timeout for setup/teardown hooks:

```typescript
hookTimeout: 15000
```

#### globals
**Type**: `boolean`
**Default**: `false`

Enable global test APIs (like Jest) instead of explicit imports:

```typescript
globals: true // Now use describe, it, expect without imports
```

**Note**: When enabled, add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

#### watch
**Type**: `boolean`
**Default**: Auto-detected (true in interactive, false in CI)

Enable watch mode:

```typescript
watch: true // Force watch mode
```

### Test Environment

#### environment
**Type**: `'node' | 'jsdom' | 'happy-dom' | 'edge-runtime' | string`
**Default**: `'node'`

Test execution environment:

```typescript
environment: 'jsdom' // For DOM testing
```

**Per-file override** using docblock:

```javascript
/**
 * @vitest-environment jsdom
 */
import { test } from 'vitest'
// This file runs in jsdom
```

#### environmentOptions
**Type**: `object`

Pass options to the environment:

```typescript
environment: 'jsdom',
environmentOptions: {
  jsdom: {
    resources: 'usable',
    pretendToBeVisual: true
  }
}
```

### Projects Configuration (Monorepo/Multi-Config)

#### projects
**Type**: `(string | ProjectConfig)[]`

Define multiple test projects with different configurations:

```typescript
projects: [
  // Glob patterns
  'packages/*',
  '!packages/excluded',

  // Inline configs
  {
    test: {
      name: 'unit',
      environment: 'node',
      include: ['**/*.unit.test.ts']
    }
  },
  {
    test: {
      name: 'integration',
      environment: 'jsdom',
      include: ['**/*.integration.test.ts']
    }
  }
]
```

**Key rules:**
- All projects must have unique names
- Projects can extend root config with `extends: true`
- Cannot use `coverage`, `reporters`, etc. in project configs (root only)

#### sequence.groupOrder
**Type**: `(projectName: string) => number`

Control project execution order (lower numbers run first):

```typescript
projects: [
  { test: { name: 'unit', sequence: { groupOrder: 1 } } },
  { test: { name: 'e2e', sequence: { groupOrder: 2 } } }
]
```

### Performance & Concurrency

#### pool
**Type**: `'threads' | 'forks' | 'vmThreads' | 'vmForks'`
**Default**: `'forks'`

Test execution strategy:

```typescript
pool: 'threads' // Use worker threads (faster startup)
```

**Strategies:**
- `threads` - Multi-threading (faster startup, shared memory)
- `forks` - Child processes (better isolation)
- `vmThreads` - VM context in threads
- `vmForks` - VM context in forks

#### maxWorkers
**Type**: `number`
**Default**: Available CPUs

Maximum concurrent workers:

```typescript
maxWorkers: 4 // Limit to 4 workers
```

**Environment variable**: `VITEST_MAX_WORKERS`

#### isolate
**Type**: `boolean`
**Default**: `true`

Run each test file in isolation:

```typescript
isolate: false // Run all tests in same context (faster but less isolated)
```

**Warning**: Disabling can cause test pollution if tests modify global state.

#### fileParallelism
**Type**: `boolean`
**Default**: `true`

Run test files in parallel:

```typescript
fileParallelism: true // Parallel execution
```

#### vmMemoryLimit
**Type**: `string`
**Default**: `'512MB'`

Memory limit before worker recycling (vmThreads/vmForks only):

```typescript
vmMemoryLimit: '1GB'
```

### Coverage Configuration

#### coverage.enabled
**Type**: `boolean`
**Default**: `false`

Enable coverage collection:

```typescript
coverage: {
  enabled: true
}
```

**CLI**: `vitest --coverage` or `vitest run --coverage`

#### coverage.provider
**Type**: `'v8' | 'istanbul' | 'custom'`
**Default**: `'v8'`

Coverage provider:

```typescript
coverage: {
  provider: 'v8' // Recommended default
}
```

**Installation**:
```bash
pnpm add -D @vitest/coverage-v8
# or
pnpm add -D @vitest/coverage-istanbul
```

#### coverage.include ⚠️ IMPORTANT (v4.0+)
**Type**: `string[]`

**REQUIRED** in Vitest 4.0+ to include uncovered files:

```typescript
coverage: {
  include: [
    'src/**/*.{ts,tsx}',
    'lib/**/*.{js,jsx}'
  ]
}
```

**Without this**: Only files imported during tests will be covered.

#### coverage.exclude
**Type**: `string[]`

Patterns to exclude from coverage:

```typescript
coverage: {
  exclude: [
    '**/node_modules/**',
    '**/test/**',
    '**/*.test.{ts,tsx}',
    '**/*.spec.{ts,tsx}',
    '**/types/**',
    '**/*.d.ts'
  ]
}
```

#### coverage.reporter
**Type**: `string[]`
**Default**: `['text', 'html', 'clover', 'json']`

Coverage report formats:

```typescript
coverage: {
  reporter: ['text', 'html', 'lcov', 'json-summary']
}
```

**Common reporters**:
- `text` - Console output
- `html` - HTML report in browser
- `lcov` - For CI/CD tools
- `json` - JSON format
- `json-summary` - Summary JSON

#### coverage.reportsDirectory
**Type**: `string`
**Default**: `'./coverage'`

Where to write coverage reports:

```typescript
coverage: {
  reportsDirectory: './test-results/coverage'
}
```

#### coverage.thresholds
**Type**: `object`

Fail tests if coverage below thresholds:

```typescript
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
    perFile: true // Apply thresholds per file
  }
}
```

#### coverage.ignoreClassMethods
**Type**: `string[]`

Ignore specific class methods (now works with V8 in v4.0+):

```typescript
coverage: {
  ignoreClassMethods: ['constructor', 'render']
}
```

### Browser Mode Configuration

#### browser.enabled
**Type**: `boolean`
**Default**: `false`

Enable browser testing:

```typescript
browser: {
  enabled: true
}
```

#### browser.provider
**Type**: `BrowserProvider`

Browser provider (v4.0+ requires object, not string):

```typescript
import { playwright } from '@vitest/browser-playwright'

browser: {
  provider: playwright({
    launchOptions: {
      slowMo: 100
    }
  })
}
```

**Available providers**:
- `@vitest/browser-playwright` - Chromium, Firefox, Webkit
- `@vitest/browser-webdriverio` - Chrome, Firefox, Edge, Safari
- `@vitest/browser-preview` - Development only

#### browser.instances
**Type**: `BrowserInstance[]`

Browser instances to test against:

```typescript
browser: {
  instances: [
    { browser: 'chromium' },
    { browser: 'firefox' },
    { browser: 'webkit' }
  ]
}
```

#### browser.headless
**Type**: `boolean`
**Default**: `false`

Run browsers in headless mode:

```typescript
browser: {
  headless: true // Essential for CI
}
```

**CLI**: `--browser.headless`

#### browser.trace
**Type**: `boolean | 'on' | 'off' | 'retain-on-failure'`

Enable Playwright traces (Playwright provider only):

```typescript
browser: {
  trace: 'retain-on-failure' // Save traces only for failures
}
```

**CLI**: `--browser.trace=on`

### Setup & Lifecycle

#### setupFiles
**Type**: `string | string[]`

Files to run before each test file:

```typescript
setupFiles: ['./test/setup.ts']
```

**Multiple files**:

```typescript
setupFiles: [
  './test/setup-global.ts',
  './test/setup-dom.ts'
]
```

#### globalSetup
**Type**: `string | string[]`

Files to run once before all tests:

```typescript
globalSetup: './test/global-setup.ts'
```

**Example global setup**:

```typescript
// test/global-setup.ts
export default function setup() {
  console.log('Starting test suite')
  // Start database, etc.
}

export function teardown() {
  console.log('Cleaning up')
  // Stop database, etc.
}
```

### Mock & Spy Configuration

#### clearMocks
**Type**: `boolean`
**Default**: `false`

Clear all mocks between tests:

```typescript
clearMocks: true
```

#### mockReset
**Type**: `boolean`
**Default**: `false`

Reset all mocks between tests:

```typescript
mockReset: true
```

#### restoreMocks
**Type**: `boolean`
**Default**: `false`

Restore all mocks between tests:

```typescript
restoreMocks: true
```

#### fakeTimers
**Type**: `object`

Configure fake timer behavior:

```typescript
fakeTimers: {
  toFake: ['setTimeout', 'setInterval', 'Date']
}
```

### Snapshot Configuration

#### snapshotFormat
**Type**: `object`

Configure snapshot formatting:

```typescript
snapshotFormat: {
  printBasicPrototype: false,
  escapeString: true
}
```

#### resolveSnapshotPath
**Type**: `(testPath: string, snapExtension: string) => string`

Custom snapshot path resolution:

```typescript
resolveSnapshotPath: (testPath, snapExtension) => {
  return testPath.replace('__tests__', '__snapshots__') + snapExtension
}
```

### Reporter Configuration

#### reporters
**Type**: `string | string[] | Reporter[]`
**Default**: `'default'`

Test reporters:

```typescript
reporters: ['default', 'json', 'html']
```

**Built-in reporters**:
- `default` - Console output with tree view
- `verbose` - Detailed console output
- `dot` - Minimal dots
- `json` - JSON output
- `junit` - JUnit XML
- `tap` - TAP format
- `html` - HTML report

#### outputFile
**Type**: `string | Record<string, string>`

Write reporter output to files:

```typescript
outputFile: {
  json: './test-results.json',
  junit: './junit.xml'
}
```

### Type Checking

#### typecheck.enabled
**Type**: `boolean`
**Default**: `false`

Enable type checking alongside tests:

```typescript
typecheck: {
  enabled: true,
  checker: 'tsc' // or 'vue-tsc'
}
```

#### typecheck.checker
**Type**: `'tsc' | 'vue-tsc'`

Which type checker to use:

```typescript
typecheck: {
  checker: 'vue-tsc' // For Vue projects
}
```

### Advanced Options

#### cache
**Type**: `boolean`
**Default**: `true`

Enable test result caching:

```typescript
cache: false // Disable for debugging
```

#### bail
**Type**: `number`

Stop after N test failures:

```typescript
bail: 1 // Stop on first failure
```

**CLI**: `--bail=1`

#### passWithNoTests
**Type**: `boolean`
**Default**: `false`

Don't fail when no tests found:

```typescript
passWithNoTests: true
```

#### dangerouslyIgnoreUnhandledErrors
**Type**: `boolean`
**Default**: `false`

Ignore unhandled errors (dangerous, use sparingly):

```typescript
dangerouslyIgnoreUnhandledErrors: true
```

#### slowTestThreshold
**Type**: `number`
**Default**: `300`

Mark tests as slow above threshold (ms):

```typescript
slowTestThreshold: 1000 // 1 second
```

## Environment Variables

Vitest respects these environment variables:

- `VITEST_MAX_WORKERS` - Maximum workers
- `VITEST_POOL_ID` - Pool identifier (replaces Jest's `JEST_WORKER_ID`)
- `VITEST_WORKER_ID` - Unique worker identifier
- `VITEST_MODULE_DIRECTORIES` - Module resolution directories
- `VITEST_SKIP_INSTALL_CHECKS` - Skip automatic dependency installation prompts
- `CI` - Auto-detected by Vitest to disable watch mode

## Complete Example Configurations

### Simple Node.js Project

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['src/**/*.ts'],
      reporter: ['text', 'html']
    }
  }
})
```

### Browser Testing with Playwright

```typescript
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      headless: true
    }
  }
})
```

### Multi-Project Monorepo

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['packages/**/src/**/*.test.ts']
        }
      },
      {
        test: {
          name: 'integration',
          environment: 'jsdom',
          include: ['packages/**/tests/**/*.test.ts']
        }
      }
    ]
  }
})
```
