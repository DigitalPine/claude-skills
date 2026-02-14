---
name: vitest
description: Setup, configure, audit, and modernize Vitest testing in projects. Use when creating new test configs, auditing existing Vitest implementations for v4.0+ best practices, fixing deprecated patterns, migrating from Jest, or configuring test environments (Node.js, browser, monorepo). Checks for breaking changes, outdated configs, missing coverage settings, and performance issues. Covers browser mode, visual regression testing, and CI integration.
---

# Vitest Setup & Configuration Expert

## Trigger Condition

Use this skill when setting up Vitest testing in new or existing projects, auditing test configurations, fixing issues, migrating from Jest, or modernizing existing Vitest configurations to current best practices (Vitest 4.0+, October 2025).

**Example scenarios:**
- "Set up Vitest for this project"
- "Audit my Vitest configuration"
- "Check if my Vitest config follows best practices"
- "Fix deprecated Vitest patterns"
- "Update Vitest to v4.0+"
- "Add browser testing with Vitest"
- "Migrate from Jest to Vitest"
- "Configure Vitest for a monorepo"
- "Add visual regression testing"
- "Why are my Vitest tests slow?"
- "Review my test setup"

## Core Competencies

This skill provides:
- ✅ Modern Vitest 4.0+ setup and configuration patterns
- ✅ Browser Mode setup (playwright, webdriverio, preview providers)
- ✅ Projects-based monorepo configuration (workspaces deprecated)
- ✅ Coverage configuration (V8 and Istanbul)
- ✅ Visual regression testing setup
- ✅ Migration guidance from Jest or older Vitest versions
- ✅ TypeScript configuration and type safety
- ✅ Performance optimization and parallel execution
- ✅ CI/CD integration patterns

## Critical Context (October 2025)

### Version Requirements
- **Vitest 4.0** is the latest stable release
- Requires **Vite >=6.0.0** and **Node.js >=20.0.0**
- Major breaking changes from v3.x (see migration guide)

### Major Architectural Changes
1. **Workspaces → Projects** (v3.2+): Workspace config deprecated; use `projects` array in root config
2. **Browser Mode Stable** (v4.0): No longer experimental; requires separate provider packages
3. **V8 Coverage Improvements** (v4.0): AST-based remapping replaces v8-to-istanbul
4. **Pool Architecture Rewrite** (v4.0): Tinypool removed; unified worker management
5. **Module Runner** (v4.0): Replaces vite-node internally

### Key Deprecations & Removals (v4.0)
- ❌ `coverage.all` and `coverage.extensions` removed
- ❌ `workspace` config option (use `projects` instead)
- ❌ `poolMatchGlobs` and `environmentMatchGlobs` (use `projects` instead)
- ❌ `deps.external`, `deps.inline` (use `server.deps.*` variants)
- ❌ `basic` reporter removed
- ❌ `maxThreads`/`maxForks` (use `maxWorkers` instead)

## Required Reading

**⚠️ BEFORE providing Vitest guidance, read the appropriate reference:**

| Scenario | REQUIRED Reading |
|----------|------------------|
| Auditing existing v4+ project | `vitest-migration-guide.md` — Breaking changes are extensive |
| Upgrading from v3.x | `vitest-migration-guide.md` — Must understand removed options |
| Browser testing setup | `vitest-browser-mode.md` — Provider syntax changed completely |
| Coverage configuration | `vitest-config-reference.md` — `coverage.all` removed in v4 |
| Any configuration question | `vitest-config-reference.md` — Many options deprecated |

**Why this matters:** Vitest 4.0 has major breaking changes. Training data may contain v3 patterns that cause errors in v4 projects. Always verify against references.

## Reference Documentation

Detailed reference files in `references/`:

1. **`vitest-config-reference.md`** - Complete configuration options, best practices, common patterns
2. **`vitest-cli-reference.md`** - CLI commands, options, workflows
3. **`vitest-browser-mode.md`** - Browser testing setup, providers, component testing
4. **`vitest-migration-guide.md`** - Breaking changes, version migrations, Jest to Vitest

## Configuration Templates

The `assets/` directory contains ready-to-use configuration templates:

1. **`vitest.config.basic.ts`** - Minimal Node.js testing setup
2. **`vitest.config.browser.ts`** - Browser mode with Playwright
3. **`vitest.config.projects.ts`** - Multi-project/monorepo setup
4. **`vitest.config.coverage.ts`** - Comprehensive coverage configuration
5. **`vitest.shared.ts`** - Shared configuration pattern for projects
6. **`package.json.example`** - npm scripts and dependencies

## Workflow Process

### Phase 1: Discovery & Assessment

**Always start by understanding the current state:**

1. **Check for existing configuration:**
   - Look for `vitest.config.ts/js`, `vite.config.ts/js`
   - Check `package.json` for vitest version and scripts
   - Identify existing test files (`.test.`, `.spec.` patterns)

2. **Assess project structure:**
   - Single package or monorepo?
   - Framework used (React, Vue, Svelte, etc.)?
   - TypeScript or JavaScript?
   - Current test runner (Jest, Mocha, etc.)?

3. **Identify requirements:**
   - Node.js testing only or browser testing needed?
   - Coverage requirements?
   - Component testing needs?
   - Visual regression testing?
   - CI/CD integration requirements?

### Phase 2: Installation & Setup

**For new projects (no existing testing):**

1. Install Vitest:
   ```bash
   pnpm add -D vitest
   ```

2. Choose and install additional packages based on needs:
   ```bash
   # For browser testing with Playwright
   pnpm add -D @vitest/browser-playwright

   # For coverage (V8 is default, Istanbul available)
   pnpm add -D @vitest/coverage-v8
   # or
   pnpm add -D @vitest/coverage-istanbul

   # For jsdom/happy-dom environments
   pnpm add -D jsdom
   # or
   pnpm add -D happy-dom

   # For UI interface
   pnpm add -D @vitest/ui
   ```

3. Use appropriate config template from `assets/` directory
4. Add npm scripts to `package.json`:
   ```json
   {
     "scripts": {
       "test": "vitest",
       "test:run": "vitest run",
       "test:ui": "vitest --ui",
       "test:coverage": "vitest run --coverage"
     }
   }
   ```

**For existing projects (migrating or upgrading):**

1. Check current vitest version: `pnpm list vitest`
2. If migrating from Jest, consult `vitest-migration-guide.md`
3. If upgrading from v3.x or earlier, review breaking changes
4. Update dependencies to latest versions
5. Migrate deprecated configuration options

### Phase 3: Configuration

**Key configuration principles:**

1. **Start minimal** - Vitest works with zero config when using Vite
2. **Use projects for complexity** - Multi-environment or monorepo setups
3. **Explicit coverage.include** - Required in v4.0+ for uncovered file reporting
4. **TypeScript support** - Use `defineConfig` from `vitest/config` for type safety
5. **Shared configs** - Use `vitest.shared.ts` pattern for projects

**Common configuration patterns:**

- **Node.js only**: Use `vitest.config.basic.ts` template
- **Browser testing**: Use `vitest.config.browser.ts` template
- **Monorepo**: Use `vitest.config.projects.ts` template
- **Mixed environments**: Use projects with different environments

### Phase 4: Verification

1. **Run tests**: `pnpm test:run`
2. **Check coverage**: `pnpm test:coverage`
3. **Verify browser mode** (if configured): Tests should open browser
4. **Check CI compatibility**: Ensure headless mode works

### Phase 5: CI/CD Integration

**Key CI considerations:**

1. **Environment detection**: Vitest auto-detects CI and disables watch mode
2. **Headless browser mode**: Set `browser.headless: true` for CI
3. **Coverage reporting**: Use appropriate reporters for CI platforms
4. **Sharding support**: Use `--shard=1/3` syntax for parallel CI execution
5. **Fail-fast**: Consider `--bail=1` to stop on first failure

## Decision Trees

### Which Provider for Browser Testing?

**Choose Playwright** when:
- ✅ Need Firefox, Webkit, or Chromium support
- ✅ Want visual regression testing (screenshots, traces)
- ✅ Most comprehensive feature set
- ✅ **Recommended default**

**Choose WebdriverIO** when:
- ✅ Already using WebdriverIO in project
- ✅ Need Safari support on macOS
- ✅ Existing WebdriverIO infrastructure

**Choose Preview** when:
- ✅ Development/prototyping only
- ✅ Cannot install browser dependencies
- ⚠️ **Not for production/CI**

### Projects vs Single Config?

**Use Projects when:**
- ✅ Monorepo with multiple packages
- ✅ Need different test environments (node + browser)
- ✅ Different configurations for unit vs integration tests
- ✅ Need to run tests in parallel across configs

**Use Single Config when:**
- ✅ Simple single-package project
- ✅ All tests use same environment
- ✅ No complex configuration requirements

### Coverage Provider Choice?

**Use V8 (default) when:**
- ✅ Best performance
- ✅ Works with Vite's transformation
- ✅ **Recommended default**

**Use Istanbul when:**
- ✅ Need more accurate coverage for edge cases
- ✅ Migrating from Jest with Istanbul
- ✅ Specific reporter compatibility needs

## Common Patterns & Solutions

### Pattern: Node + Browser Tests

Use projects to separate environments:

```typescript
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['**/*.unit.test.ts']
        }
      },
      {
        test: {
          name: 'browser',
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }]
          },
          include: ['**/*.browser.test.ts']
        }
      }
    ]
  }
})
```

### Pattern: Shared Configuration for Monorepo

Create `vitest.shared.ts`:

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./test-setup.ts']
  }
})
```

Then in each package:

```typescript
import { defineProject, mergeConfig } from 'vitest/config'
import configShared from '../../vitest.shared.js'

export default mergeConfig(
  configShared,
  defineProject({
    test: {
      environment: 'jsdom'
    }
  })
)
```

### Pattern: Coverage with Uncovered Files

**Important**: In v4.0+, must explicitly define `coverage.include`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/**/__tests__/**'
      ],
      reporter: ['text', 'html', 'lcov']
    }
  }
})
```

## Anti-Patterns & Common Mistakes

### ❌ Using deprecated workspace config

```typescript
// DON'T - workspace is deprecated
export default defineConfig({
  test: {
    workspace: './vitest.workspace.js'
  }
})
```

```typescript
// DO - use projects instead
export default defineConfig({
  test: {
    projects: ['./packages/*']
  }
})
```

### ❌ Missing coverage.include in v4.0+

```typescript
// DON'T - will only cover files that were imported during tests
export default defineConfig({
  test: {
    coverage: {
      enabled: true
    }
  }
})
```

```typescript
// DO - explicitly define what to cover
export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      include: ['src/**/*.ts']
    }
  }
})
```

### ❌ Using old browser provider string syntax

```typescript
// DON'T - old v3.x syntax
export default defineConfig({
  test: {
    browser: {
      provider: 'playwright'
    }
  }
})
```

```typescript
// DO - v4.0+ requires provider object
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    browser: {
      provider: playwright()
    }
  }
})
```

### ❌ Using removed pool options

```typescript
// DON'T - removed in v4.0
export default defineConfig({
  test: {
    maxThreads: 4,
    poolOptions: {
      threads: { isolate: false }
    }
  }
})
```

```typescript
// DO - use new unified syntax
export default defineConfig({
  test: {
    maxWorkers: 4,
    isolate: false
  }
})
```

## Troubleshooting Guide

### Issue: Tests not being discovered

**Check:**
1. Test files match pattern: `**/*.{test,spec}.?(c|m)[jt]s?(x)`
2. Files not in `exclude` patterns
3. Check `include` configuration if customized
4. Use `vitest list` to see what tests Vitest found

### Issue: Module resolution errors

**Solutions:**
1. Ensure Vite config has correct `resolve.alias` entries
2. Check `tsconfig.json` paths match Vite config
3. Add `/// <reference types="vitest/config" />` to vite.config.ts
4. For external dependencies, configure `server.deps.inline`

### Issue: Coverage shows 0% or missing files

**In v4.0+:**
1. Must explicitly set `coverage.include` glob patterns
2. Check patterns actually match your source files
3. Verify files aren't in `coverage.exclude`
4. Use `coverage.all: true` only if really needed (deprecated but available)

### Issue: Browser tests failing in CI

**Check:**
1. Set `browser.headless: true` for CI environments
2. Install browser binaries: `npx playwright install` or similar
3. Use `--browser.headless` CLI flag
4. Configure appropriate timeouts for CI

### Issue: Slow test execution

**Optimization strategies:**
1. Enable parallel execution: `fileParallelism: true` (default)
2. Increase workers: `maxWorkers: <number>`
3. Use projects for different test types
4. Consider disabling `isolate` for unit tests (with caution)
5. Use `--no-cache` to rule out cache corruption

## Output & Next Steps

After completing setup, provide the user with:

1. **Summary of configuration** - What was set up and why
2. **Test commands** - How to run tests, coverage, UI
3. **File locations** - Where configs and test files are
4. **Next steps** - Suggestions for writing first tests or migrations
5. **Resources** - Links to relevant docs or examples

## When NOT to Use This Skill

- User wants to use a different test framework (Jest, Mocha, etc.)
- Testing is not relevant to the current task
- User explicitly wants to avoid testing setup

## Collaboration with Other Skills

This skill works well with:
- **nextjs-16-setup**: For Next.js projects needing testing
- **react-ink-cli**: For CLI app testing
- **xmcp-server-setup**: For MCP server testing

## Success Criteria

Configuration is successful when:
- ✅ Tests run without errors
- ✅ Configuration follows Vitest 4.0+ best practices
- ✅ Coverage reports generated (if configured)
- ✅ Browser tests work (if configured)
- ✅ CI/CD integration functional (if required)
- ✅ No deprecated options used
- ✅ TypeScript types working correctly
