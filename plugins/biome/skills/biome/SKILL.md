---
name: biome
description: Setup, configure, audit, and optimize Biome linter/formatter in JavaScript/TypeScript projects. Use when installing Biome, auditing existing configs, migrating from ESLint+Prettier, fixing configuration issues, or optimizing unsafe fix workflows. Checks for proper version pinning, Next.js integration, VS Code setup, and script configuration. Emphasizes safe handling of "unsafe" fixes in development workflows.
---

# Biome Setup and Configuration

Expert guidance for setting up and configuring Biome linter and formatter in JavaScript/TypeScript projects, with emphasis on handling unsafe fixes for routine development workflows.

## When to Use This Skill

- Setting up Biome in new or existing projects
- Auditing existing Biome configurations
- Checking if Biome config follows best practices
- Configuring Biome for Next.js, React, or vanilla JS/TS projects
- Understanding and applying unsafe fixes
- Migrating from ESLint + Prettier
- Optimizing Biome for team workflows
- Fixing Biome configuration issues
- Reviewing unsafe fix strategy
- Troubleshooting formatting or linting problems

## Core Principles

**Unsafe fixes in routine workflow** - While Biome marks certain fixes as "unsafe" because they may change code semantics, many of these (like removing unused imports/variables) are safe enough for routine development and should be part of standard lint/format workflows.

**Single tool simplicity** - Biome replaces both ESLint and Prettier with a single, fast tool. Configure once, use everywhere.

## Installation

### New Projects

For Next.js 16+ projects, use the built-in flag:
```bash
pnpm create next-app@latest --biome my-app
```

### Existing Projects

Install with exact version pinning and initialize:
```bash
pnpm add -D -E @biomejs/biome
npx @biomejs/biome init
```

**Why these steps:**
- `-E` flag ensures consistent behavior across team members and CI
- `init` generates `biome.json` with correct schema version and modern syntax

Then customize the generated config with your project's needs (see Configuration section below).

## Configuration File Structure

Biome uses `biome.json` (or `biome.jsonc` for comments) in project root.

### Basic Configuration

After running `biome init` and `biome migrate`, customize the generated config:

```json
{
  "$schema": "https://biomejs.dev/schemas/[VERSION]/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": true,
    "includes": ["src/**", "app/**", "lib/**", "*.ts", "*.js"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedImports": {
          "level": "error",
          "fix": "safe"
        },
        "noUnusedVariables": {
          "level": "error",
          "fix": "safe"
        }
      },
      "style": {
        "useConst": {
          "level": "error",
          "fix": "safe"
        },
        "useTemplate": {
          "level": "error",
          "fix": "safe"
        }
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "semicolons": "always",
      "trailingCommas": "all",
      "arrowParentheses": "asNeeded"
    }
  },
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

**Note**: The rule overrides in the `linter.rules` section change commonly-used rules from "unsafe" to "safe" fixes:
- `noUnusedImports` - Automatically removes unused imports
- `noUnusedVariables` - Automatically prefixes unused variables with underscore
- `useConst` - Automatically changes `let` to `const` for never-reassigned variables
- `useTemplate` - Automatically converts string concatenation to template literals

These fixes will now apply on editor save and during normal `--write` operations without needing the `--unsafe` flag. See "Decision Framework" section for details on when to use these overrides.

## Understanding Unsafe Fixes

### What Makes a Fix "Unsafe"?

Biome marks fixes as unsafe when they might change code semantics or behavior:

- **noUnusedImports**: Removes unused imports (unsafe because might remove associated comments or affect type-only imports)
- **noUnusedVariables**: Prefixes unused variables with underscore (unsafe because doesn't remove, just silences)
- Other transformation rules that modify logic

### Safe vs Unsafe Philosophy

**Safe fixes** are guaranteed not to change program behavior and can auto-apply on save.

**Unsafe fixes** might alter semantics and require the `--unsafe` flag.

### "Safe Enough" Unsafe Fixes

For routine development, these unsafe fixes are typically safe to apply regularly:

1. **noUnusedImports** - Removing unused imports is almost always desired
2. **noUnusedVariables** - Flagging unused variables catches bugs
3. **organizeImports** (via assist) - Sorting imports improves consistency

## Package.json Scripts

### Recommended Scripts

```json
{
  "scripts": {
    "format": "biome format --write .",
    "lint": "biome lint --write .",
    "check": "biome check --write .",
    "check:ci": "biome ci ."
  }
}
```

**Script purposes:**
- `format` - Format files only (dev workflow)
- `lint` - Lint and auto-fix issues (dev workflow)
- `check` - Combined format + lint + organize imports (dev workflow)
- `check:ci` - CI-safe check that fails without modifying files

**Note on removed scripts:**
- `format:check` and `lint:check` are redundant - `biome ci` handles all CI checking
- For local read-only checks, use `biome ci .` directly

### With Unsafe Fixes (Optional)

If you haven't configured individual rules as "safe" (see Configuration section), add `--unsafe` to dev scripts:

```json
{
  "scripts": {
    "lint": "biome lint --write --unsafe .",
    "check": "biome check --write --unsafe ."
  }
}
```

**Only needed if:**
- You want unused imports/variables removed automatically
- Rules like `noUnusedImports` still marked as "unsafe" in your config

### Usage Patterns

```bash
# Daily development - lint and auto-fix
pnpm lint

# Pre-commit/PR - comprehensive check with all fixes
pnpm check

# CI - verify only, no changes
pnpm check:ci

# Quick format only
pnpm format
```

## Next.js Integration

When using Biome with Next.js, disable ESLint during builds:

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Using Biome instead of ESLint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
```

## Editor Integration

### VS Code

Install extension: `biomejs.biome`

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

**Important**: Editor integration applies only safe fixes on save. Unsafe fixes require manual CLI execution with `--unsafe` flag.

## Migration from ESLint + Prettier

### Step-by-Step

1. **Install Biome**
   ```bash
   pnpm add -D -E @biomejs/biome
   npx @biomejs/biome init
   ```

2. **Remove old tooling**
   ```bash
   pnpm remove eslint prettier eslint-config-next eslint-config-prettier
   ```

3. **Delete config files**
   - `.eslintrc.json` or `.eslintrc.js`
   - `.prettierrc` or `prettier.config.js`
   - `.prettierignore`

4. **Update package.json scripts** (see Scripts section above)

5. **Format codebase**
   ```bash
   pnpm format
   pnpm lint  # includes --unsafe if configured
   ```

6. **Update Next.js config** (if applicable, see Next.js Integration)

7. **Commit changes**
   ```bash
   git add .
   git commit -m "Migrate from ESLint+Prettier to Biome"
   ```

## Decision Framework

### When to Use Unsafe Fixes

**✅ Use --unsafe flag for:**
- Daily development linting (`pnpm lint`)
- Pre-commit cleanup (`pnpm check`)
- Removing unused imports/variables
- Team workflows where code review catches issues

**❌ Skip --unsafe flag for:**
- CI checks (`pnpm check:ci`)
- Automated tools with no human review
- Generated code
- Legacy code with uncertain test coverage

### When to Configure Individual Rule Safety

**Recommended: Override common "safe enough" unsafe rules**

These rules are marked unsafe by default but are almost always safe to apply automatically:

```json
{
  "linter": {
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedImports": {
          "level": "error",
          "fix": "safe"
        },
        "noUnusedVariables": {
          "level": "error",
          "fix": "safe"
        }
      },
      "style": {
        "useConst": {
          "level": "error",
          "fix": "safe"
        },
        "useTemplate": {
          "level": "error",
          "fix": "safe"
        }
      }
    }
  }
}
```

**Impact**: These fixes will now apply on editor save and in normal `--write` operations without needing `--unsafe` flag.

**Why these are safe enough:**
- `noUnusedImports` - Removing unused imports is desired 98% of the time
- `noUnusedVariables` - Only prefixes with underscore, doesn't remove code
- `useConst` - Changing `let` to `const` for never-reassigned variables improves code quality
- `useTemplate` - Template literals are preferred modern syntax

## Common Patterns

### Monorepo Configuration

Root `biome.json` with shared settings:

```json
{
  "$schema": "https://biomejs.dev/schemas/[VERSION]/schema.json",
  "extends": ["./packages/*/biome.json"],
  "files": {
    "ignoreUnknown": true
  }
}
```

Package-specific overrides:

```json
{
  "extends": ["../../biome.json"],
  "files": {
    "includes": ["src/**", "test/**"]
  }
}
```

### Project-Specific Ignore Patterns

Use `includes` with negation patterns (modern syntax):

```json
{
  "files": {
    "includes": [
      "**",
      "!**/node_modules/**",
      "!**/.next/**",
      "!**/dist/**",
      "!**/build/**",
      "!**/coverage/**",
      "!**/*.generated.ts",
      "!**/__snapshots__/**"
    ]
  }
}
```

**Note:** The deprecated `ignore` field will cause configuration errors. Use `includes` with exclamation mark (!) prefix for exclusions.

### Gradual Adoption

Start with recommended rules, then add more as codebase improves:

```json
{
  "linter": {
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedImports": "error",
        "noUnusedVariables": "warn"  // Warn first, error later
      }
    }
  }
}
```

## Troubleshooting

### Issue: "Found an unknown key `ignore`" error

**Symptom:** Biome check/lint/format fails with deserialize error about unknown `ignore` key.

**Cause:** Config uses deprecated `files.ignore` field (pre-2.2 syntax). Modern biome uses `files.includes` with negation patterns.

**Solution - Option 1 (Auto-fix):**
```bash
# Let biome migrate deprecated syntax automatically
npx @biomejs/biome migrate --write

# Verify config is fixed
npx @biomejs/biome check .
```

**Solution - Option 2 (Manual fix):**
Update `biome.json` to use modern syntax:
```json
// OLD (deprecated - causes error)
"files": {
  "ignore": ["node_modules/**", "dist/**"]
}

// NEW (modern - works)
"files": {
  "includes": ["**", "!**/node_modules/**", "!**/dist/**"]
}
```

**When you see this:**
- Copying old config examples from Stack Overflow, old docs, etc.
- Using config written for biome < 2.2
- After upgrading biome versions

### Issue: Biome not formatting in editor
- Ensure Biome extension installed
- Check `.vscode/settings.json` has correct `defaultFormatter`
- Restart editor after installing extension
- Verify `biome.json` exists and is valid

### Issue: Unused imports not being removed
- Check that `noUnusedImports` is enabled (included in `recommended`)
- Use `--unsafe` flag: `pnpm biome lint --write --unsafe .`
- Verify `assist.actions.source.organizeImports` is enabled

### Issue: Different formatting between CLI and editor
- Ensure exact Biome version pinned with `-E` flag
- Check no conflicting Prettier extension active
- Run `npx @biomejs/biome version` to verify version
- Clear editor cache and restart

### Issue: Build fails with ESLint errors
- Add `eslint: { ignoreDuringBuilds: true }` to `next.config.js`
- Remove ESLint dependencies
- Ensure Biome scripts in package.json

### Issue: Git shows too many changes after migration
Expected! Biome has different formatting defaults than Prettier. Do migration in dedicated commit:
```bash
pnpm format
pnpm lint --unsafe  # or pnpm check --unsafe
git add .
git commit -m "chore: apply Biome formatting"
```


## Resources

- Official docs: https://biomejs.dev
- Configuration guide: https://next.biomejs.dev/guides/configure-biome/
- Linter rules: https://biomejs.dev/linter/rules/
- Next.js integration: https://next.biomejs.dev/linter/domains/#next

## Version Notes

This skill is current as of Biome 2.3+ (November 2025). Check official docs for latest features.
