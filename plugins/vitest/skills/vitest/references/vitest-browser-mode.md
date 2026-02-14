# Vitest Browser Mode Guide

Complete guide to browser testing with Vitest 4.0+ (October 2025).

## Overview

Browser Mode allows running tests in actual browsers instead of simulated environments (jsdom, happy-dom). This provides more realistic and reliable testing for UI applications.

**Status**: Stable in Vitest 4.0+ (experimental tag removed)

## Why Browser Mode?

### Advantages over jsdom/happy-dom

1. **Real browser behavior** - Actual rendering engine, not simulation
2. **Accurate DOM APIs** - No missing or incomplete implementations
3. **Visual testing** - Screenshot comparison, visual regression
4. **Real browser quirks** - Catch browser-specific issues
5. **Better debugging** - Use browser DevTools directly

### When to Use

- ✅ Component testing (React, Vue, Svelte, etc.)
- ✅ Integration tests requiring real DOM
- ✅ Visual regression testing
- ✅ Tests using browser-specific APIs (Canvas, WebGL, etc.)
- ✅ Accessibility testing with real browser tools

### When NOT to Use

- ❌ Simple unit tests (Node.js environment is faster)
- ❌ Pure logic tests (no DOM interaction)
- ❌ API/server tests

## Installation

### Quick Setup

Automated initialization (recommended):

```bash
npx vitest init browser
```

### Manual Installation

Choose a browser provider:

#### Playwright (Recommended)

```bash
pnpm add -D vitest @vitest/browser-playwright
```

**Supports**: Chromium, Firefox, Webkit

**Install browsers**:

```bash
npx playwright install
```

#### WebdriverIO

```bash
pnpm add -D vitest @vitest/browser-webdriverio
```

**Supports**: Chrome, Firefox, Edge, Safari

#### Preview (Development Only)

```bash
pnpm add -D vitest @vitest/browser-preview
```

**Note**: Preview provider is for local development only, not suitable for CI/CD.

## Configuration

### Basic Playwright Setup

```typescript
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [
        { browser: 'chromium' }
      ]
    }
  }
})
```

### Multiple Browsers

```typescript
browser: {
  enabled: true,
  provider: playwright(),
  instances: [
    { browser: 'chromium' },
    { browser: 'firefox' },
    { browser: 'webkit' }
  ]
}
```

### Headless Mode (CI)

```typescript
browser: {
  enabled: true,
  provider: playwright(),
  instances: [{ browser: 'chromium' }],
  headless: true  // Essential for CI/CD
}
```

### Provider Options

```typescript
import { playwright } from '@vitest/browser-playwright'

browser: {
  provider: playwright({
    launchOptions: {
      slowMo: 100,        // Slow down operations (ms)
      devtools: true,     // Open DevTools
      args: ['--no-sandbox'] // Browser flags
    }
  })
}
```

### WebdriverIO Configuration

```typescript
import { webdriverio } from '@vitest/browser-webdriverio'

browser: {
  provider: webdriverio({
    capabilities: {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: ['--disable-gpu']
      }
    }
  }),
  instances: [
    { browser: 'chrome' }
  ]
}
```

## Browser Compatibility

### Minimum Versions

- **Chrome**: ≥87
- **Firefox**: ≥78
- **Safari**: ≥15.4
- **Edge**: ≥88

### Provider Support

**Playwright**:
- Chromium ✅
- Firefox ✅
- Webkit ✅

**WebdriverIO**:
- Chrome ✅
- Firefox ✅
- Edge ✅
- Safari ✅ (macOS only)

## Writing Browser Tests

### Basic Component Test

```typescript
import { test, expect } from 'vitest'
import { render } from 'vitest-browser-react'
import { Button } from './Button'

test('button renders correctly', async () => {
  const { getByRole } = render(<Button>Click me</Button>)

  const button = getByRole('button')
  await expect.element(button).toBeInTheDocument()
  await expect.element(button).toHaveTextContent('Click me')
})
```

### User Interactions

```typescript
import { test, expect } from 'vitest'
import { render, userEvent } from 'vitest/browser'
import { Counter } from './Counter'

test('counter increments on click', async () => {
  const { getByRole } = render(<Counter />)

  const button = getByRole('button', { name: /increment/i })
  const count = getByRole('status')

  await expect.element(count).toHaveTextContent('0')

  await userEvent.click(button)
  await expect.element(count).toHaveTextContent('1')
})
```

### Locators

Use Testing Library-style locators:

```typescript
import { page } from 'vitest/browser'

// By role
const button = page.getByRole('button', { name: 'Submit' })

// By label
const input = page.getByLabelText('Email')

// By text
const heading = page.getByText('Welcome')

// By test ID
const element = page.getByTestId('user-profile')

// By placeholder
const search = page.getByPlaceholder('Search...')
```

### Assertions

```typescript
import { expect } from 'vitest'

// Element assertions
await expect.element(button).toBeInTheDocument()
await expect.element(button).toBeVisible()
await expect.element(button).toBeEnabled()
await expect.element(button).toHaveTextContent('Click')
await expect.element(input).toHaveValue('test@example.com')

// Viewport assertions (v4.0+)
await expect.element(section).toBeInViewport()

// Standard assertions
expect(data).toEqual({ id: 1 })
```

## Framework-Specific Setup

### React

```bash
pnpm add -D vitest-browser-react @testing-library/react
```

```typescript
import { render } from 'vitest-browser-react'
import { Component } from './Component'

test('renders component', async () => {
  const { getByText } = render(<Component />)
  await expect.element(getByText('Hello')).toBeInTheDocument()
})
```

### Vue

```bash
pnpm add -D vitest-browser-vue @testing-library/vue
```

```typescript
import { render } from 'vitest-browser-vue'
import Component from './Component.vue'

test('renders component', async () => {
  const { getByText } = render(Component)
  await expect.element(getByText('Hello')).toBeInTheDocument()
})
```

### Svelte

```bash
pnpm add -D vitest-browser-svelte @testing-library/svelte
```

```typescript
import { render } from 'vitest-browser-svelte'
import Component from './Component.svelte'

test('renders component', async () => {
  const { getByText } = render(Component)
  await expect.element(getByText('Hello')).toBeInTheDocument()
})
```

## Visual Regression Testing (v4.0+)

### Screenshot Comparison

```typescript
import { test, expect, page } from 'vitest/browser'

test('button matches screenshot', async () => {
  await page.viewport(1280, 720)

  // First run creates baseline
  // Subsequent runs compare against baseline
  await expect(page).toMatchScreenshot('button-default.png')
})
```

### Component Screenshots

```typescript
test('component visual regression', async () => {
  const { container } = render(<Button variant="primary">Click</Button>)

  await expect.element(container.firstChild).toMatchScreenshot()
})
```

### Screenshot Options

```typescript
await expect(page).toMatchScreenshot('button.png', {
  threshold: 0.2,        // Allowed difference (0-1)
  maxDiffPixels: 100,    // Max different pixels
  maxDiffPixelRatio: 0.05 // Max different pixel ratio
})
```

## Playwright Traces (v4.0+)

### Enable Traces

**Configuration**:

```typescript
browser: {
  provider: playwright(),
  trace: 'retain-on-failure'  // or 'on', 'off'
}
```

**CLI**:

```bash
vitest --browser.trace=on
```

### Trace Options

- `'on'` - Always record traces
- `'off'` - Never record traces
- `'retain-on-failure'` - Only save traces for failed tests (recommended)

### View Traces

Traces appear as annotations in HTML reporter:

```bash
vitest run --browser.enabled --reporter=html
```

Or use Playwright Trace Viewer:

```bash
npx playwright show-trace path/to/trace.zip
```

## Advanced Features

### Frame Locator (v4.0+)

Access elements within iframes:

```typescript
import { page } from 'vitest/browser'

const frame = page.frameLocator('iframe[title="Payment"]')
const input = frame.getByLabel('Card number')
await userEvent.fill(input, '4242424242424424')
```

**Note**: Playwright provider only

### Viewport Control

```typescript
import { page } from 'vitest/browser'

test('responsive layout', async () => {
  // Desktop
  await page.viewport(1920, 1080)
  // Test desktop layout

  // Mobile
  await page.viewport(375, 667)
  // Test mobile layout
})
```

### Network Interception

```typescript
import { page } from 'vitest/browser'

test('mocks API calls', async () => {
  await page.route('**/api/users', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify([{ id: 1, name: 'Test User' }])
    })
  })

  // Test component that fetches users
})
```

### Custom Browser Context

```typescript
import { playwright } from '@vitest/browser-playwright'

browser: {
  provider: playwright({
    contextOptions: {
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 2,
      locale: 'en-US',
      permissions: ['geolocation']
    }
  })
}
```

## Debugging Browser Tests

### Visual Debugging (Development)

```typescript
browser: {
  headless: false,  // See browser window
  provider: playwright({
    launchOptions: {
      slowMo: 500,    // Slow down operations
      devtools: true  // Open DevTools
    }
  })
}
```

### Debug with Inspector

```bash
vitest --inspect --browser.enabled
```

Then connect DevTools: `chrome://inspect`

### VSCode Debug Button (v4.0+)

The Vitest VSCode extension now supports "Debug Test" button for browser tests.

### Screenshots on Failure

```typescript
import { afterEach, page } from 'vitest/browser'

afterEach(async (context) => {
  if (context.task.result?.state === 'fail') {
    await page.screenshot({
      path: `./screenshots/${context.task.name}.png`
    })
  }
})
```

## Combining Node and Browser Tests

Use projects to run both environments:

```typescript
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

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

**Run separately**:

```bash
vitest --project unit
vitest --project browser
```

## Limitations & Gotchas

### Cannot Spy on Module Exports Directly

```typescript
// ❌ Doesn't work
import { myFunction } from './module'
vi.spyOn(myFunction)

// ✅ Use mock with spy option
vi.mock('./module', { spy: true })
```

### Thread-Blocking APIs Auto-Mocked

```typescript
// These are automatically mocked to prevent blocking:
alert()
confirm()
prompt()

// Mock manually if needed:
vi.stubGlobal('alert', vi.fn())
```

### Variable Mocking Limitations

```typescript
// ❌ Cannot mock variables directly
export let count = 0
// Can't spy on 'count'

// ✅ Export methods to modify state
export let count = 0
export const increment = () => count++
export const getCount = () => count
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Browser Tests
on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run browser tests
        run: pnpm test:browser

      - name: Upload traces on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-traces
          path: .vitest-results/
```

### Essential CI Configuration

```typescript
browser: {
  enabled: true,
  provider: playwright(),
  instances: [{ browser: 'chromium' }],
  headless: true,  // Required for CI
  trace: 'retain-on-failure'  // Debug failures
}
```

### Docker

```dockerfile
FROM node:20

# Install Playwright dependencies
RUN npx playwright install --with-deps chromium

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm test -- --browser.enabled --browser.headless
```

## Performance Tips

### Reuse Browser Contexts

Configure provider to reuse contexts between tests (faster):

```typescript
browser: {
  provider: playwright({
    contextOptions: {
      // Shared context config
    }
  })
}
```

### Parallel Execution

```typescript
test: {
  fileParallelism: true,  // Run test files in parallel
  browser: {
    // Each worker gets own browser instance
  }
}
```

### Selective Browser Testing

```bash
# Run unit tests in Node, browser tests separately
vitest --project unit        # Fast
vitest --project browser     # Slower, run less frequently
```

## Common Patterns

### Page Object Model

```typescript
// pages/LoginPage.ts
import { page, userEvent } from 'vitest/browser'

export class LoginPage {
  get emailInput() {
    return page.getByLabel('Email')
  }

  get passwordInput() {
    return page.getByLabel('Password')
  }

  get submitButton() {
    return page.getByRole('button', { name: 'Login' })
  }

  async login(email: string, password: string) {
    await userEvent.fill(this.emailInput, email)
    await userEvent.fill(this.passwordInput, password)
    await userEvent.click(this.submitButton)
  }
}

// login.test.ts
import { test, expect } from 'vitest'
import { LoginPage } from './pages/LoginPage'

test('user can login', async () => {
  const loginPage = new LoginPage()
  await loginPage.login('user@example.com', 'password123')

  await expect.element(page.getByText('Dashboard')).toBeInTheDocument()
})
```

### Custom Fixtures

```typescript
import { test as base } from 'vitest'
import { render } from 'vitest-browser-react'

const test = base.extend({
  authenticatedUser: async ({}, use) => {
    // Setup authenticated state
    localStorage.setItem('token', 'fake-token')
    await use({ id: 1, name: 'Test User' })
    // Cleanup
    localStorage.clear()
  }
})

test('shows user profile', async ({ authenticatedUser }) => {
  const { getByText } = render(<Profile />)
  await expect.element(getByText(authenticatedUser.name)).toBeInTheDocument()
})
```

### Waiting for Conditions

```typescript
import { waitFor } from 'vitest/browser'

test('waits for async operation', async () => {
  const button = page.getByRole('button')
  await userEvent.click(button)

  await waitFor(() => {
    expect(page.getByText('Success')).toBeInTheDocument()
  }, { timeout: 5000 })
})
```
