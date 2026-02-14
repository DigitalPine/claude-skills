import { defineConfig } from 'vitest/config'

/**
 * Vitest configuration with comprehensive coverage setup
 *
 * This configuration focuses on coverage collection with:
 * - V8 provider (default, fastest)
 * - Explicit include patterns (required in v4.0+)
 * - Multiple reporter formats
 * - Coverage thresholds for quality gates
 * - Appropriate exclusions
 *
 * Install coverage provider:
 * - pnpm add -D @vitest/coverage-v8
 * OR
 * - pnpm add -D @vitest/coverage-istanbul
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    // Coverage configuration
    coverage: {
      // Enable coverage collection
      enabled: true,

      // Coverage provider
      // 'v8' - Faster, works with Vite's transformation (recommended)
      // 'istanbul' - More accurate for edge cases, slower
      provider: 'v8',

      // ⚠️ IMPORTANT: Must explicitly define what to cover (v4.0+)
      // Without this, only files imported during tests will be covered
      include: [
        'src/**/*.{ts,tsx}',
        'lib/**/*.{js,jsx}'
        // Add all source directories that should be covered
      ],

      // Patterns to exclude from coverage
      exclude: [
        // Test files
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/__tests__/**',
        '**/__mocks__/**',

        // Build artifacts
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.{idea,git,cache,output,temp}/**',

        // Config files
        '**/vite.config.*',
        '**/vitest.config.*',
        '**/playwright.config.*',
        '**/*.config.{js,ts}',

        // Type definitions
        '**/types/**',
        '**/*.d.ts',

        // Entry points (often just pass-through)
        '**/main.{ts,tsx}',
        '**/index.{ts,tsx}',

        // Generated files
        '**/.next/**',
        '**/.nuxt/**'
      ],

      // Report formats
      // Common options: 'text', 'html', 'lcov', 'json', 'json-summary'
      reporter: [
        'text',          // Console output
        'html',          // Browser-viewable HTML report
        'lcov',          // For CI/CD tools (Codecov, Coveralls, etc.)
        'json-summary'   // Machine-readable summary
      ],

      // Where to write coverage reports
      reportsDirectory: './coverage',

      // Coverage thresholds (fail tests if below these percentages)
      thresholds: {
        lines: 80,       // 80% line coverage required
        functions: 80,   // 80% function coverage required
        branches: 80,    // 80% branch coverage required
        statements: 80,  // 80% statement coverage required

        // Apply thresholds per file instead of globally
        // More strict but catches files with low coverage
        // perFile: true,

        // Auto-update thresholds (prevents regression)
        // autoUpdate: true,

        // Fail if any file is 100% covered but not included in thresholds
        // '100': true
      },

      // Ignore specific class methods (v4.0+ works with V8)
      ignoreClassMethods: [
        'constructor',
        // 'render',
        // 'componentDidMount'
      ],

      // Report uncovered lines (default: true)
      reportOnFailure: true,

      // Skip full coverage check (useful for gradual adoption)
      // skipFull: false,

      // Clean coverage directory before each run
      clean: true
    },

    // Clear mocks between tests
    clearMocks: true,

    // Test timeout
    testTimeout: 5000
  }
})
