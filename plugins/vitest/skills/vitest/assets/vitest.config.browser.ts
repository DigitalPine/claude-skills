import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
// import { webdriverio } from '@vitest/browser-webdriverio' // Alternative

/**
 * Vitest configuration with Browser Mode
 *
 * Requirements:
 * - pnpm add -D @vitest/browser-playwright
 * - npx playwright install (to install browsers)
 *
 * Suitable for:
 * - Component testing (React, Vue, Svelte, etc.)
 * - Integration tests requiring real DOM
 * - Visual regression testing
 * - Tests using browser-specific APIs
 *
 * For Node.js testing, see vitest.config.basic.ts
 * For mixed Node + Browser, see vitest.config.projects.ts
 */
export default defineConfig({
  test: {
    // Browser mode configuration
    browser: {
      enabled: true,

      // Provider: playwright, webdriverio, or preview (dev only)
      provider: playwright({
        // Provider-specific options
        launchOptions: {
          // slowMo: 100,    // Slow down operations (ms) - useful for debugging
          // devtools: true, // Open DevTools - useful for debugging
        }
      }),

      // Browser instances to test against
      instances: [
        { browser: 'chromium' },
        // { browser: 'firefox' },
        // { browser: 'webkit' }
      ],

      // Run headless (no GUI) - essential for CI/CD
      headless: true,

      // Enable Playwright traces (Playwright provider only)
      // Options: 'on', 'off', 'retain-on-failure' (recommended)
      trace: 'retain-on-failure'
    },

    // Use globals like Jest
    globals: true,

    // Files to run before each test file
    // setupFiles: ['./test/setup.ts'],

    // Test timeout (browser tests may need longer timeout)
    testTimeout: 15000, // 15s for browser tests

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
  },

  // If using React/Vue/Svelte, configure framework plugin here
  // plugins: [react()]
})
