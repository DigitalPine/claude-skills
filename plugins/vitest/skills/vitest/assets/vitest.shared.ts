import { defineConfig } from 'vitest/config'

/**
 * Shared Vitest configuration
 *
 * Use this pattern in monorepos to share configuration across packages.
 *
 * Structure:
 * - Root: vitest.config.ts (uses projects)
 * - Root: vitest.shared.ts (this file - shared config)
 * - Packages: packages/foo/vitest.config.ts (merges shared config)
 *
 * Usage in package config:
 *
 * ```typescript
 * import { defineProject, mergeConfig } from 'vitest/config'
 * import configShared from '../../vitest.shared.js'
 *
 * export default mergeConfig(
 *   configShared,
 *   defineProject({
 *     test: {
 *       environment: 'jsdom' // Package-specific override
 *     }
 *   })
 * )
 * ```
 *
 * Note: When using projects, individual configs can't extend the root
 * config anymore (since they'd inherit the projects array). This separate
 * shared file pattern solves that problem.
 */
export default defineConfig({
  test: {
    // Global test APIs (describe, it, expect without imports)
    globals: true,

    // Files to run before each test file (across all packages)
    setupFiles: ['./test/setup.ts'],

    // Clear mocks between tests
    clearMocks: true,

    // Restore mocks to original implementation
    restoreMocks: true,

    // Mock reset (clear history and reset implementation)
    mockReset: false,

    // Test timeout (can be overridden per package)
    testTimeout: 5000,

    // Default include patterns
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],

    // Default exclude patterns
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.{idea,git,cache,output,temp}/**'
    ],

    // Snapshot configuration (shared format)
    snapshotFormat: {
      printBasicPrototype: false,
      escapeString: true
    }

    // Note: Coverage config stays in root vitest.config.ts
    // It's process-wide and can't be set per-project
  },

  // Shared resolve aliases (adjust to your monorepo structure)
  resolve: {
    alias: {
      // Example: '@company/utils': path.resolve(__dirname, 'packages/utils/src')
    }
  }

  // Framework plugins can also be shared here if needed
  // plugins: []
})
