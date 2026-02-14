import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

/**
 * Multi-project Vitest configuration
 *
 * Use this pattern for:
 * - Monorepo with multiple packages
 * - Separating unit tests (Node) and integration tests (Browser)
 * - Different test environments for different test types
 * - Running tests with different configurations
 *
 * Projects replace the deprecated "workspace" configuration (v3.2+)
 *
 * Run specific projects:
 * - pnpm test --project unit
 * - pnpm test --project browser
 * - pnpm test --project unit --project integration
 */
export default defineConfig({
  test: {
    // Global options (inherited by all projects unless overridden)
    globals: true,
    clearMocks: true,

    // Define multiple projects
    projects: [
      // ==================================================
      // Unit tests - Node.js environment
      // ==================================================
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['**/*.unit.test.{ts,tsx}'],
          // Fast parallel execution for unit tests
          fileParallelism: true
        }
      },

      // ==================================================
      // Integration tests - jsdom environment
      // ==================================================
      {
        test: {
          name: 'integration',
          environment: 'jsdom',
          include: ['**/*.integration.test.{ts,tsx}'],
          testTimeout: 10000 // Longer timeout
        }
      },

      // ==================================================
      // Browser tests - Real browser environment
      // ==================================================
      {
        test: {
          name: 'browser',
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            headless: true,
            trace: 'retain-on-failure'
          },
          include: ['**/*.browser.test.{ts,tsx}'],
          testTimeout: 15000
        }
      },

      // ==================================================
      // Monorepo pattern - Glob-based package discovery
      // ==================================================
      // 'packages/*',  // Discovers all packages
      // '!packages/excluded',  // Exclude specific packages

      // ==================================================
      // Monorepo pattern - Explicit package configs
      // ==================================================
      // {
      //   extends: true,  // Inherit root config
      //   test: {
      //     name: 'package-auth',
      //     root: './packages/auth',
      //     environment: 'node'
      //   }
      // },
    ],

    // Control project execution order (optional)
    // Lower numbers run first
    // sequence: {
    //   groupOrder: (project) => {
    //     if (project === 'unit') return 1
    //     if (project === 'integration') return 2
    //     if (project === 'browser') return 3
    //     return 999
    //   }
    // },

    // Coverage configuration (root-level only, not per-project)
    coverage: {
      enabled: false, // Enable via CLI: --coverage
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}', 'packages/*/src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/types/**'
      ],
      reporter: ['text', 'html', 'lcov']
    }
  }
})
