# Next.js 16 create-next-app CLI Reference

Complete reference for non-interactive Next.js 16 project creation. All flags documented here are current as of Next.js 16.0.0 (October 2025).

## Basic Command

```bash
npx create-next-app@latest <project-name> [options]
```

## Language & TypeScript

- `--ts` or `--typescript` — Initialize as TypeScript project (default)
- `--js` or `--javascript` — Initialize as JavaScript project

## Linting & Formatting

**IMPORTANT:** Next.js 16 removed `next lint` command. Choose one of:

- `--eslint` — Initialize with ESLint config
- `--biome` — Initialize with Biome config (recommended for new projects)
- `--no-linter` — Skip linter configuration entirely

**Note on --biome flag:**
- Using `--biome` during project creation skips ESLint installation entirely
- Biome is configured automatically with `biome.json`
- No need to add `eslint: { ignoreDuringBuilds: true }` to `next.config.js` (ESLint not installed)
- Biome scripts automatically added to `package.json`

## Styling

- `--tailwind` — Initialize with Tailwind CSS config (default)

## Project Structure

- `--app` — Initialize as App Router project (default)
- `--api` — Initialize with only route handlers (no pages/app)
- `--src-dir` — Initialize inside a `src/` directory
- `--empty` — Initialize an empty project (minimal boilerplate)

## Build Tools

- `--turbopack` — Force enable Turbopack in package.json (enabled by default in Next.js 16)
- `--webpack` — Force enable Webpack in package.json
- `--react-compiler` — Initialize with React Compiler enabled

## Package Managers

- `--use-npm` — Bootstrap using npm
- `--use-pnpm` — Bootstrap using pnpm
- `--use-yarn` — Bootstrap using Yarn
- `--use-bun` — Bootstrap using Bun

## Setup Control

- `--skip-install` — Skip installing packages
- `--disable-git` — Skip git initialization
- `--yes` — Use previous preferences or defaults (skip all prompts)

## Examples & Customization

- `-e` or `--example [name]` — Bootstrap with a Next.js example
- `--example-path <path>` — Specify example path separately
- `--import-alias <alias>` — Set import alias (default "@/*")

## Preferences

- `--reset-preferences` — Reset stored preferences

## Typical Non-Interactive Commands

### New project with Biome, TypeScript, pnpm
```bash
npx create-next-app@latest my-app --biome --ts --use-pnpm --yes
```

### New project with Turbopack, src directory, Tailwind
```bash
npx create-next-app@latest my-app --turbopack --src-dir --tailwind --yes
```

### Empty project for custom setup
```bash
npx create-next-app@latest my-app --empty --no-linter --skip-install --yes
```

## Key Changes in Next.js 16

1. **`next lint` removed**: Must use ESLint or Biome directly
2. **Turbopack is default**: 2-5× faster production builds, 10× faster Fast Refresh
3. **Async-first routing**: `params` and `searchParams` must be awaited
4. **Minimum Node.js 20.9+**: Node 18 no longer supported
5. **TypeScript 5.1+ required**: Earlier versions not supported
6. **Cache Components**: New `cacheComponents` config, `use cache` directive
7. **proxy.ts replaces middleware.ts**: Clarifies network boundary
8. **New caching APIs**: `updateTag()`, `refresh()`, updated `revalidateTag()`

## Breaking Changes - Complete List

### Version Requirements

| Requirement | Version |
|-------------|---------|
| Node.js | 20.9+ (LTS) - Node.js 18 no longer supported |
| TypeScript | 5.1.0+ |
| Browsers | Chrome 111+, Edge 111+, Firefox 111+, Safari 16.4+ |

### Removals (Previously Deprecated)

| Removed | Replacement |
|---------|-------------|
| **AMP support** | All AMP APIs removed (`useAmp`, `config.amp`) |
| **`next lint` command** | Use Biome or ESLint directly |
| **`devIndicators` options** | `appIsrStatus`, `buildActivity`, `buildActivityPosition` removed |
| **`serverRuntimeConfig`, `publicRuntimeConfig`** | Use environment variables |
| **`experimental.turbopack`** | Moved to top-level `turbopack` config |
| **`experimental.dynamicIO`** | Renamed to `cacheComponents` |
| **`experimental.ppr` flag** | Evolved into Cache Components model |
| **`export const experimental_ppr`** | Route-level PPR export removed |
| **`unstable_rootParams()`** | Alternative API coming in upcoming minor |

### Async API Changes (REQUIRED)

These APIs are now async and **must** be awaited:

```typescript
// All require await in Next.js 16
const resolvedParams = await params;
const resolvedSearchParams = await searchParams;
const cookieStore = await cookies();
const headersList = await headers();
const draft = await draftMode();
```

**Metadata image routes also affected:**

```typescript
// app/og-image/[id]/route.tsx
export async function GET(request, { params }) {
  const { id } = await params;  // Must await
}

// generateImageMetadata now returns Promise
export async function generateImageMetadata({ params }) {
  const id = await params.id;  // Must await
}
```

### Image Configuration Changes

| Setting | Old Default | New Default |
|---------|-------------|-------------|
| `minimumCacheTTL` | 60 seconds | 14400 seconds (4 hours) |
| `imageSizes` | Included `16` | Removed `16` from defaults |
| `qualities` | `[1..100]` | `[75]` |
| `dangerouslyAllowLocalIP` | `true` | `false` |
| `maximumRedirects` | Unlimited | 3 maximum |

### Other Behavior Changes

| Change | Details |
|--------|---------|
| **Turbopack default** | Use `--webpack` to opt out |
| **`@next/eslint-plugin-next`** | Defaults to ESLint Flat Config format |
| **Parallel routes** | All slots now require explicit `default.js` |
| **Automatic scroll-behavior** | Removed; add `data-scroll-behavior="smooth"` to opt in |
| **Sass API** | `sass-loader` bumped to v16 |
| **Local images with query strings** | Requires `images.localPatterns` config |
| **Prefetch cache** | Complete rewrite with layout deduplication and incremental prefetching |
| **Concurrent dev/build** | `next dev` and `next build` now use separate directories, can run simultaneously |

### Deprecations (Will Be Removed)

| Deprecated | Replacement |
|-----------|-------------|
| **`middleware.ts`** | Rename to `proxy.ts` |
| **`next/legacy/image`** | Use `next/image` |
| **`images.domains`** | Use `images.remotePatterns` |
| **`revalidateTag(tag)` single argument** | Use `revalidateTag(tag, profile)` or `updateTag(tag)` |

## Migration Notes

### Automated Migration

```bash
npx @next/codemod@canary upgrade latest
```

### Manual Migration Steps

1. **Async params/cookies/headers:**
   ```typescript
   // Before
   export default function Page({ params }) {
     const { id } = params;
   }

   // After
   export default async function Page({ params }) {
     const { id } = await params;
   }
   ```

2. **middleware.ts → proxy.ts:**
   ```bash
   npx @next/codemod@canary middleware-to-proxy .
   ```

3. **Parallel routes - add default.js to all slots:**
   ```typescript
   // app/@modal/default.tsx
   export default function Default() {
     return null;
   }
   ```

4. **Update revalidateTag() calls:**
   ```typescript
   // Before (deprecated)
   revalidateTag('posts');

   // After - background revalidation
   revalidateTag('posts', 'max');

   // After - immediate (in Server Actions)
   updateTag('posts');
   ```

5. **Replace next lint:**
   - If migrating from `next lint`: `npx @next/codemod@canary next-lint-to-eslint-cli .`
   - `next build` no longer runs linting automatically
   - Configure linting in CI/package.json scripts instead

### Enable Cache Components (Optional but Recommended)

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  cacheComponents: true,
};
```

See `references/cache-components-guide.md` for full documentation.
