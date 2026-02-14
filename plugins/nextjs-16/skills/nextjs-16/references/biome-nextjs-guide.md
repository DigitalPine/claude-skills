# Biome Setup Guide for Next.js

Complete guide for integrating Biome linter and formatter with Next.js 16 projects. Information current as of Biome 2.0+ and Next.js 16 (October 2025).

## Why Biome for Next.js 16?

- Next.js 16 removed `next lint` — explicit linter choice required
- Biome offers 50-100x faster performance than ESLint+Prettier
- Single tool for linting + formatting
- First-class Next.js support via `--biome` flag in create-next-app
- Zero configuration needed for basic setup

## Installation

### For Existing Projects

Install with exact version pinning (recommended):

```bash
# pnpm (recommended)
pnpm add -D -E @biomejs/biome

# npm
npm i -D -E @biomejs/biome

# yarn
yarn add -D -E @biomejs/biome

# bun
bun add -D -E @biomejs/biome
```

The `-E` flag pins exact version for consistency across team.

### Initialize Configuration

```bash
npx @biomejs/biome init
```

Creates `biome.json` with default settings.

## Configuration File Structure

Biome uses `biome.json` (or `biome.jsonc` for comments) in project root.

### Basic Configuration

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.5/schema.json",
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "files": {
    "ignore": [
      "node_modules",
      ".next",
      "dist",
      "build",
      "out"
    ]
  }
}
```

### Next.js-Optimized Configuration

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.5/schema.json",
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "always",
      "trailingCommas": "all",
      "arrowParentheses": "asNeeded"
    }
  },
  "files": {
    "ignore": [
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",
      "*.config.js",
      "*.config.ts"
    ],
    "include": [
      "app/**/*.{ts,tsx,js,jsx}",
      "pages/**/*.{ts,tsx,js,jsx}",
      "components/**/*.{ts,tsx,js,jsx}",
      "lib/**/*.{ts,tsx,js,jsx}",
      "src/**/*.{ts,tsx,js,jsx}"
    ]
  }
}
```

## Integration with Next.js Build

**CRITICAL:** Next.js doesn't support Biome natively in `next build`. Must disable ESLint checking.

### Update next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds since using Biome
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
```

Or for next.config.ts:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
```

## Package.json Scripts

Add these scripts for development workflow:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "format": "biome format --write .",
    "format:check": "biome format .",
    "lint": "biome lint --write .",
    "lint:check": "biome lint .",
    "check": "biome check --write .",
    "check:ci": "biome ci ."
  }
}
```

### Script Explanations

- `format` — Format all files in place
- `format:check` — Check formatting without modifying files
- `lint` — Lint and auto-fix issues
- `lint:check` — Lint without auto-fixing
- `check` — Run both formatter and linter with fixes
- `check:ci` — Optimized command for CI (formatting + linting, no fixes)

## Editor Integration

### VS Code

Install the official Biome extension:
- Extension ID: `biomejs.biome`
- Provides real-time linting and formatting
- Auto-format on save support

Add to `.vscode/settings.json`:

```json
{
  "[javascript]": {
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true
  }
}
```

## CI/CD Integration

Add to GitHub Actions or similar:

```yaml
- name: Check code with Biome
  run: pnpm biome ci .
```

The `biome ci` command:
- Checks formatting (no changes)
- Runs linter (no fixes)
- Exits with error if issues found
- Optimized for CI performance

## Migration from ESLint + Prettier

1. Remove old dependencies:
   ```bash
   pnpm remove eslint prettier eslint-config-next eslint-config-prettier
   ```

2. Delete config files:
   - `.eslintrc.json` or `.eslintrc.js`
   - `.prettierrc` or `prettier.config.js`
   - `.prettierignore`

3. Install Biome (see Installation section)

4. Format codebase:
   ```bash
   pnpm biome format --write .
   pnpm biome lint --write .
   ```

5. Update `next.config.js` to disable ESLint (see Integration section)

## Language Support

Biome treats all JavaScript variants under the `"javascript"` key:
- JavaScript (.js)
- TypeScript (.ts)
- JSX (.jsx)
- TSX (.tsx)

## File Organization

Biome auto-discovers `biome.json` by searching:
1. Current working directory
2. Parent directories recursively

If both `biome.json` and `biome.jsonc` exist, `biome.json` takes precedence.

## Protected Files (Always Ignored)

Biome automatically ignores:
- `package-lock.json`
- `yarn.lock`
- `npm-shrinkwrap.json`
- `composer.lock`

## Common Patterns

### Ignore Specific Directories

```json
{
  "files": {
    "ignore": [
      "node_modules/**",
      ".next/**",
      "coverage/**",
      "test/**/*.snap"
    ]
  }
}
```

### Tool-Specific Includes

```json
{
  "linter": {
    "includes": ["src/**"],
    "excludes": ["src/**/*.test.ts"]
  }
}
```

### Language-Specific Overrides

```json
{
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "lineWidth": 120
    }
  },
  "json": {
    "formatter": {
      "enabled": false
    }
  }
}
```

## Troubleshooting

### Issue: Biome not formatting in editor
- Ensure Biome extension installed
- Check `.vscode/settings.json` has correct `defaultFormatter`
- Restart editor after installing extension

### Issue: Build fails with ESLint errors
- Add `eslint: { ignoreDuringBuilds: true }` to `next.config.js`
- Run `next build` again

### Issue: Different formatting between CLI and editor
- Ensure exact Biome version pinned (`-E` flag)
- Check no conflicting Prettier extension active
- Run `npx @biomejs/biome version` to verify version

## Resources

- Official docs: https://biomejs.dev
- Configuration guide: https://next.biomejs.dev/guides/configure-biome/
- Next.js integration: https://next.biomejs.dev/linter/domains/#next
