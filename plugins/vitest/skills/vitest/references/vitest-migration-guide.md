# Vitest Migration Guide

Comprehensive migration guide for Vitest version upgrades and Jest migration (October 2025).

## Vitest 4.0 Breaking Changes

### V8 Coverage Provider Changes

The coverage system received major improvements with AST-based remapping replacing the old `v8-to-istanbul` method.

#### coverage.all and coverage.extensions Removed

**Breaking**: These options no longer exist.

**Before (v3.x)**:
```typescript
coverage: {
  all: true,  // Automatically include all files
  extensions: ['.ts', '.tsx']
}
```

**After (v4.0+)**:
```typescript
coverage: {
  // Must explicitly define what to cover
  include: ['src/**/*.{ts,tsx}']
}
```

**Migration strategy**:
1. Identify all source directories that need coverage
2. Create explicit `include` patterns
3. Add `exclude` patterns to filter out test files

**Example migration**:

```typescript
// v3.x config
coverage: {
  all: true,
  exclude: ['**/*.test.ts']
}

// v4.0+ config
coverage: {
  include: [
    'src/**/*.ts',
    'lib/**/*.ts',
    'packages/*/src/**/*.ts'
  ],
  exclude: [
    '**/*.test.ts',
    '**/*.spec.ts',
    '**/types/**'
  ]
}
```

#### coverage.ignoreEmptyLines Removed

Lines without runtime code no longer appear in reports automatically.

**Before**: Had to explicitly disable with `ignoreEmptyLines: false`
**After**: Empty lines always ignored (no config needed)

#### coverage.experimentalAstAwareRemapping Removed

**Before**: Opt-in feature
**After**: Default and only method (no config needed)

#### coverage.ignoreClassMethods Now Works with V8

**Breaking**: Previously only worked with Istanbul provider.

**After (v4.0+)**:
```typescript
coverage: {
  provider: 'v8',
  ignoreClassMethods: ['constructor', 'render', 'dispose']
}
```

### Workspace → Projects

The `workspace` configuration was deprecated in v3.2 and completely replaced with `projects`.

#### Basic Migration

**Before (v3.x)**:
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    workspace: './vitest.workspace.js'
  }
})

// vitest.workspace.js
export default [
  'packages/*',
  {
    test: { name: 'unit', environment: 'node' }
  }
]
```

**After (v4.0+)**:
```typescript
// vitest.config.ts - everything in one file
export default defineConfig({
  test: {
    projects: [
      'packages/*',
      {
        test: { name: 'unit', environment: 'node' }
      }
    ]
  }
})
```

#### Glob Pattern Migration

**Before**: Separate workspace file
**After**: Inline in main config

```typescript
projects: [
  'packages/*',
  '!packages/excluded',
  {
    extends: true,
    test: { name: 'browser', environment: 'jsdom' }
  }
]
```

### Browser Provider Configuration

Browser providers now use object syntax instead of strings.

#### Provider Import Required

**Before (v3.x)**:
```typescript
browser: {
  enabled: true,
  provider: 'playwright',  // String
  name: 'chromium'
}
```

**After (v4.0+)**:
```typescript
import { playwright } from '@vitest/browser-playwright'

browser: {
  enabled: true,
  provider: playwright(),  // Object with import
  instances: [{ browser: 'chromium' }]
}
```

#### Context Import Changes

**Before (v3.x)**:
```typescript
import { page } from '@vitest/browser/context'
import { userEvent } from '@vitest/browser/utils'
```

**After (v4.0+)**:
```typescript
import { page, userEvent } from 'vitest/browser'
```

#### Migration Steps

1. Install separate provider package:
   ```bash
   pnpm add -D @vitest/browser-playwright
   ```

2. Import provider in config:
   ```typescript
   import { playwright } from '@vitest/browser-playwright'
   ```

3. Update provider syntax:
   ```typescript
   provider: playwright()
   ```

4. Update browser specification:
   ```typescript
   // Old: name: 'chromium'
   // New:
   instances: [{ browser: 'chromium' }]
   ```

5. Update imports in test files:
   ```typescript
   // Old: from '@vitest/browser/context'
   // New: from 'vitest/browser'
   ```

### Pool Architecture Rewrite

Tinypool removed; unified worker management introduced.

#### Worker Configuration Changes

**Before (v3.x)**:
```typescript
maxThreads: 4,
maxForks: 4,
minThreads: 1,
minForks: 1,
singleThread: true,
singleFork: true,
poolOptions: {
  threads: {
    isolate: false
  },
  forks: {
    isolate: false
  },
  vmThreads: {
    memoryLimit: '1GB'
  }
}
```

**After (v4.0+)**:
```typescript
maxWorkers: 4,
isolate: false,
vmMemoryLimit: '1GB'
```

#### Environment Variable Changes

**Before**: `VITEST_MAX_THREADS`, `VITEST_MAX_FORKS`
**After**: `VITEST_MAX_WORKERS`

#### Migration Examples

**Example 1: Single thread configuration**

```typescript
// Before
{ singleThread: true }

// After
{ maxWorkers: 1, isolate: false }
```

**Example 2: Pool-specific options**

```typescript
// Before
poolOptions: {
  threads: { isolate: false }
}

// After
isolate: false
```

**Example 3: VM memory limits**

```typescript
// Before
poolOptions: {
  vmThreads: { memoryLimit: '2GB' }
}

// After
vmMemoryLimit: '2GB'
```

### Mock Behavior Changes

#### vi.fn().getMockName() Return Value

**Breaking**: Now returns `"vi.fn()"` instead of `"spy"`.

**Impact**: Snapshots containing mock names will need updating.

**Migration**:
```bash
# Update snapshots
vitest -u
```

#### vi.restoreAllMocks Behavior

**Breaking**: Only restores manual `vi.spyOn` calls; automocks unaffected.

**Before**: Restored all mocks including automocks
**After**: Manual spies only

**Migration**: If relying on automock restoration, explicitly clear them:

```typescript
import { afterEach, vi } from 'vitest'

afterEach(() => {
  vi.resetModules()  // Clear module cache
  vi.restoreAllMocks()
})
```

#### mock.invocationCallOrder

**Breaking**: Now starts at `1` instead of `0` (matching Jest).

**Before (v3.x)**:
```typescript
expect(mock.invocationCallOrder).toBe(0)  // First call
```

**After (v4.0+)**:
```typescript
expect(mock.invocationCallOrder).toBe(1)  // First call
```

### Constructor Mocking Support

New feature allows spying on constructors.

**Before**: Would fail
**After**: Works with proper implementation

**Requirements**:
- Use `function` or `class` syntax (not arrow functions)

**Example**:

```typescript
class Cart {
  Apples: new (count: number) => { getApples: () => number }
}

const cart = new Cart()

// Now works in v4.0+
vi.spyOn(cart, 'Apples')
  .mockImplementation(function (this: any) {
    this.getApples = () => 0
  })
```

### Removed Options & APIs

#### Deprecated Test Configuration

**Removed**: Third argument to `test()` for options

**Before (v3.x)**:
```typescript
test('name', () => {}, { timeout: 5000 })  // ❌ Removed
```

**After (v4.0+)**:
```typescript
test('name', () => {}, 5000)  // ✅ Second argument
```

#### poolMatchGlobs & environmentMatchGlobs

**Removed**: Use `projects` instead.

**Before (v3.x)**:
```typescript
poolMatchGlobs: [
  ['**/*.unit.test.ts', 'threads'],
  ['**/*.integration.test.ts', 'forks']
]
```

**After (v4.0+)**:
```typescript
projects: [
  {
    test: {
      name: 'unit',
      include: ['**/*.unit.test.ts'],
      pool: 'threads'
    }
  },
  {
    test: {
      name: 'integration',
      include: ['**/*.integration.test.ts'],
      pool: 'forks'
    }
  }
]
```

#### deps.* Configuration

**Removed**: `deps.external`, `deps.inline`, `deps.fallbackCJS`
**Use instead**: `server.deps.*` variants

**Before (v3.x)**:
```typescript
deps: {
  inline: ['react', 'react-dom'],
  external: ['some-module']
}
```

**After (v4.0+)**:
```typescript
server: {
  deps: {
    inline: ['react', 'react-dom'],
    external: ['some-module']
  }
}
```

#### browser.testerScripts

**Removed**: Use `browser.testerHtmlPath` instead.

**Before (v3.x)**:
```typescript
browser: {
  testerScripts: ['./setup.js']
}
```

**After (v4.0+)**:
```typescript
browser: {
  testerHtmlPath: './test.html'  // Inject scripts in custom HTML
}
```

#### Reporter Changes

**Removed**: `basic` reporter

**Migration**:
```typescript
// Before
reporters: ['basic']

// After (equivalent)
reporters: [['default', { summary: false }]]
```

**Changed**: `verbose` reporter now shows flat list instead of tree

### Module Runner Replaces Vite-Node

Internal execution engine changed.

#### Environment Variable Changes

**Before**: `VITE_NODE_DEPS_MODULE_DIRECTORIES`
**After**: `VITEST_MODULE_DIRECTORIES`

**Migration**:
```bash
# Before
VITE_NODE_DEPS_MODULE_DIRECTORIES=node_modules,custom_modules vitest

# After
VITEST_MODULE_DIRECTORIES=node_modules,custom_modules vitest
```

#### Custom Environment Changes

If you have custom environments:

**Before (v3.x)**:
```typescript
export default {
  transformMode: 'web'
}
```

**After (v4.0+)**:
```typescript
export default {
  viteEnvironment: 'client'
}
```

#### deps.optimizer Changes

**Before**: `deps.optimizer.web`
**After**: `deps.optimizer.client`

```typescript
// Before
deps: {
  optimizer: {
    web: { enabled: true }
  }
}

// After
server: {
  deps: {
    optimizer: {
      client: { enabled: true }
    }
  }
}
```

## Jest to Vitest Migration

### Installation

```bash
# Remove Jest
pnpm remove jest @types/jest

# Install Vitest
pnpm add -D vitest
```

### Configuration Migration

#### jest.config.js → vitest.config.ts

**Jest config**:
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}']
}
```

**Vitest config**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      include: ['src/**/*.{js,jsx,ts,tsx}']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### Import Changes

#### Option 1: Use Global APIs

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true  // Enable Jest-like globals
  }
})

// tsconfig.json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}

// No imports needed
describe('test', () => {
  it('works', () => {
    expect(true).toBe(true)
  })
})
```

#### Option 2: Explicit Imports (Recommended)

```typescript
import { describe, it, expect, vi } from 'vitest'

describe('test', () => {
  it('works', () => {
    expect(true).toBe(true)
  })
})
```

### Mock Changes

#### Module Mocking

**Jest**:
```typescript
jest.mock('./module', () => 'hello')
```

**Vitest**:
```typescript
vi.mock('./module', () => ({ default: 'hello' }))
```

**Important**: Vitest requires explicit exports; Jest doesn't.

#### Mock Reset Behavior

**Jest**: `mockReset()` replaces with empty function returning `undefined`
**Vitest**: `mockReset()` reverts to original implementation

**Migration**: If you relied on Jest behavior, use `mockClear()` instead.

#### Spy Restoration

**Jest**:
```typescript
jest.restoreAllMocks()  // Restores everything
```

**Vitest**:
```typescript
vi.restoreAllMocks()  // Only manual spies
vi.resetModules()      // Clear module cache
```

### Timer Changes

#### setTimeout Replacement

**Jest**:
```typescript
jest.setTimeout(10000)
```

**Vitest**:
```typescript
import { vi } from 'vitest'
vi.setConfig({ testTimeout: 10000 })
```

#### Fake Timers

**Jest**: Supports legacy timers
**Vitest**: Only modern fake timers

**Migration**: Remove `legacy: true` if present:

```typescript
// Jest
jest.useFakeTimers({ legacy: true })  // Not supported

// Vitest
vi.useFakeTimers()  // Modern only
```

### Environment Variable Changes

**Jest**: `JEST_WORKER_ID`
**Vitest**: `VITEST_POOL_ID` (pool identifier) + `VITEST_WORKER_ID` (unique worker)

**Migration**:
```typescript
// Jest
const workerId = process.env.JEST_WORKER_ID

// Vitest
const poolId = process.env.VITEST_POOL_ID
const workerId = process.env.VITEST_WORKER_ID  // More unique
```

### Test Name Formatting

**Jest**: Names joined with spaces
```
Suite Test Name
```

**Vitest**: Names joined with `>`
```
Suite > Test Name
```

**Impact**: If parsing test names, update logic.

### Snapshot Changes

Generally compatible, but path resolution differs:

**Jest**: Uses `__snapshots__` folder by default
**Vitest**: Same default, but can customize with `resolveSnapshotPath`

**Migration**: Usually no changes needed; re-run tests to verify.

### Package.json Scripts

**Jest**:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**Vitest**:
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

### Coverage Provider

**Jest**: Uses Istanbul by default
**Vitest**: Uses V8 by default (faster)

**Migration options**:

1. **Switch to V8** (recommended):
   ```bash
   pnpm add -D @vitest/coverage-v8
   ```

2. **Keep Istanbul** (if needed):
   ```bash
   pnpm add -D @vitest/coverage-istanbul
   ```
   ```typescript
   coverage: {
     provider: 'istanbul'
   }
   ```

## Migration Checklist

### Upgrading from v3.x to v4.0

- [ ] Update vitest to v4.0+
- [ ] Replace `workspace` with `projects` if used
- [ ] Add explicit `coverage.include` patterns
- [ ] Update browser provider to object syntax with import
- [ ] Install separate browser provider package
- [ ] Update `@vitest/browser/*` imports to `vitest/browser`
- [ ] Replace `maxThreads`/`maxForks` with `maxWorkers`
- [ ] Move `poolOptions` to top-level config
- [ ] Update `deps.*` to `server.deps.*`
- [ ] Replace `VITEST_MAX_THREADS` with `VITEST_MAX_WORKERS` in CI
- [ ] Update snapshots if using mock names
- [ ] Verify `mock.invocationCallOrder` if used (now 1-indexed)
- [ ] Remove third argument to `test()` if used
- [ ] Replace `poolMatchGlobs` with `projects`
- [ ] Run tests and verify coverage reports

### Migrating from Jest

- [ ] Uninstall Jest and @types/jest
- [ ] Install Vitest
- [ ] Create vitest.config.ts from jest.config.js
- [ ] Decide: globals or explicit imports
- [ ] Update module mocks to export objects
- [ ] Replace `jest` with `vi` in code
- [ ] Update `jest.setTimeout()` to `vi.setConfig()`
- [ ] Remove legacy timer usage
- [ ] Update environment variable references
- [ ] Update package.json scripts
- [ ] Install coverage provider
- [ ] Update CI configuration
- [ ] Run tests and fix any issues
- [ ] Update snapshots with `vitest -u`

## Troubleshooting Common Migration Issues

### Issue: Coverage shows 0% after v4 upgrade

**Cause**: Missing `coverage.include` configuration
**Solution**: Add explicit include patterns:

```typescript
coverage: {
  include: ['src/**/*.{ts,tsx}']
}
```

### Issue: Browser tests failing after v4 upgrade

**Cause**: Provider syntax changed
**Solution**: Update to object syntax with import

```typescript
// Install
pnpm add -D @vitest/browser-playwright

// Config
import { playwright } from '@vitest/browser-playwright'

browser: {
  provider: playwright(),
  instances: [{ browser: 'chromium' }]
}
```

### Issue: Import errors from @vitest/browser/context

**Cause**: Import paths changed in v4.0
**Solution**: Update to `vitest/browser`:

```typescript
// Old
import { page } from '@vitest/browser/context'

// New
import { page } from 'vitest/browser'
```

### Issue: Mock tests failing after Jest migration

**Cause**: Vitest requires explicit exports
**Solution**: Always return objects from `vi.mock()`:

```typescript
// Jest (works)
jest.mock('./module', () => 'hello')

// Vitest (required)
vi.mock('./module', () => ({ default: 'hello' }))
```

### Issue: Tests running twice or not isolated

**Cause**: Pool configuration incorrect after v4 migration
**Solution**: Verify `maxWorkers` and `isolate` settings:

```typescript
{
  maxWorkers: 4,
  isolate: true  // Ensure proper isolation
}
```
