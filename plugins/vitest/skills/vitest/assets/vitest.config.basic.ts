import { defineConfig } from 'vitest/config'

/**
 * Basic Vitest configuration for Node.js testing
 *
 * This is a minimal setup suitable for:
 * - Unit tests in Node.js environment
 * - Library/utility testing
 * - Backend/API testing
 *
 * For browser/component testing, see vitest.config.browser.ts
 * For monorepo setup, see vitest.config.projects.ts
 */
export default defineConfig({
  test: {
    // Use globals like Jest (describe, it, expect without imports)
    // Set to false if you prefer explicit imports
    globals: true,

    // Node.js environment (default)
    environment: 'node',

    // Files to run before each test file
    // setupFiles: ['./test/setup.ts'],

    // Files to run once before all tests
    // globalSetup: ['./test/global-setup.ts'],

    // Include patterns for test files
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],

    // Exclude patterns
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**'
    ],

    // Test timeout (milliseconds)
    testTimeout: 5000,

    // Clear mocks between tests
    clearMocks: true,

    // Coverage configuration (optional)
    // coverage: {
    //   enabled: true,
    //   provider: 'v8',
    //   include: ['src/**/*.{ts,tsx}'],
    //   exclude: [
    //     '**/*.test.{ts,tsx}',
    //     '**/*.spec.{ts,tsx}',
    //     '**/types/**'
    //   ],
    //   reporter: ['text', 'html', 'lcov']
    // }
  }
})
