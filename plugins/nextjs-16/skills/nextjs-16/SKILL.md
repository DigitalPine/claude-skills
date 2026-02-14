---
name: nextjs-16
description: Setup, configure, audit, and modernize Next.js 16 projects with contemporary tooling. Use when creating new projects, adding tooling (Biome, shadcn/ui, Vercel flags), auditing existing implementations for best practices, or fixing outdated patterns. Covers Cache Components (use cache directive), proxy.ts migration, breaking changes, async APIs, Turbopack, and correct Vercel flags setup. Provides factual implementation patterns as of December 2025.
---

# Next.js 16 Project Setup

## Overview

Guide Claude through setting up Next.js 16 projects with modern tooling: Cache Components, Biome linter/formatter, shadcn/ui components, and Vercel feature flags with Toolbar integration. Emphasizes adaptive workflows using Claude's tools (Read, Edit, Write, Bash) rather than rigid scripts, enabling Claude to handle edge cases and project-specific requirements.

**Next.js 16 Flagship Features:**
- **Cache Components** - Explicit opt-in caching with `use cache` directive
- **proxy.ts** - Replaces middleware.ts for clearer network boundary
- **Turbopack stable** - Default bundler with 2-10× performance gains
- **New caching APIs** - `updateTag()`, `refresh()`, updated `revalidateTag()`

## When to Use This Skill

Trigger this skill when user requests:
- "Set up a new Next.js project"
- "Initialize Next.js with Biome and shadcn"
- "Add Vercel feature flags to my Next.js app"
- "Configure Next.js 16 with modern tooling"
- "Audit my Next.js project"
- "Review my Next.js 16 setup"
- "Check if my Next.js project follows best practices"
- "Fix Next.js 16 breaking changes"
- "Update my Next.js project to latest patterns"
- "Why is my Next.js 16 build failing?"
- "Modernize my Next.js configuration"
- "Set up caching in Next.js 16" / "use cache directive"
- "Migrate middleware to proxy" / "proxy.ts setup"
- "Enable Cache Components" / "cacheComponents config"
- "revalidateTag not working" / "updateTag usage"

## Required Reading

**⚠️ Read the relevant reference BEFORE each task:**

| Task | REQUIRED Reading |
|------|------------------|
| New project setup | `references/nextjs-16-cli-reference.md` — CLI flags, breaking changes |
| Biome configuration | `references/biome-nextjs-guide.md` — Next.js-specific setup |
| shadcn/ui setup | `references/shadcn-setup-guide.md` — non-interactive init |
| Vercel feature flags | `references/vercel-flags-implementation.md` — **CRITICAL: prevents hallucination** |
| Cache Components | `references/cache-components-guide.md` — flagship feature |
| Middleware → proxy | `references/proxy-migration-guide.md` — migration path |

**Skipping references leads to hallucinated patterns.** Especially for Vercel flags — training data contains deprecated `@vercel/flags` patterns.

## Core Philosophy

Use Claude as the multi-tool orchestrator:
1. **Detect current state** using Read/Bash tools
2. **Make adaptive decisions** based on what exists
3. **Reference factual docs** in `references/` for current patterns
4. **Use example assets** as templates to copy/adapt
5. **Validate incrementally** after each major step

Never guess at API patterns — **always consult references first**.

## Workflow Decision Tree

Start here to determine the appropriate path:

```
Is this a new project or existing project?
├─ New Project
│  ├─ Run create-next-app with full options
│  ├─ Enable Cache Components if requested
│  ├─ Initialize Biome if requested
│  ├─ Initialize shadcn if requested
│  └─ Set up Vercel flags if requested
│
└─ Existing Project
   ├─ Detect current setup (ESLint? Biome? Tailwind? middleware.ts?)
   ├─ Check for Next.js 16 breaking changes (async APIs, middleware→proxy)
   ├─ Add requested tooling incrementally
   ├─ Check for conflicts before proceeding
   └─ Preserve existing configurations when possible
```

## 1. New Project Setup

### Step 1: Create Next.js Project

Use `references/nextjs-16-cli-reference.md` (per Required Reading) for exact flags.

**Key decisions:**
- Package manager: Prefer `pnpm`, fall back to user's choice
- TypeScript: Use `--ts` (default, recommended)
- Linter: Use `--biome` if requested, otherwise `--eslint`
- Src directory: Ask user preference
- Turbopack: Enabled by default in Next.js 16

**Example command construction:**
```bash
npx create-next-app@latest <project-name> \
  --ts \
  --use-pnpm \
  --biome \
  --tailwind \
  --app \
  --yes
```

**Adaptive decisions:**
- Check if project directory already exists
- Detect if user is already in a git repo
- Verify Node.js version >= 20.9 (Next.js 16 requirement)

### Step 2: Initialize shadcn/ui (if requested)

Use `references/shadcn-setup-guide.md` (per Required Reading) for non-interactive setup.

**Prerequisite check:**
- Verify Tailwind CSS is installed (required by shadcn)
- If missing, shadcn init will fail — handle gracefully

**Command:**
```bash
npx shadcn@latest init -y -b zinc --css-variables
```

**Post-init verification:**
- Confirm `components.json` created
- Verify `lib/utils.ts` exists with `cn()` function
- Check `components/ui/` directory created

**Optional: Add starter components**
Ask user if they want common components:
```bash
npx shadcn@latest add button card input label dialog
```

### Step 3: Configure Biome (if using)

Use `references/biome-nextjs-guide.md` (per Required Reading) for Next.js-specific config.

**If Biome was used in create-next-app:**
- Configuration already initialized
- Verify `biome.json` exists and is sensible

**If adding Biome to existing project:**
1. Install: `pnpm add -D -E @biomejs/biome`
2. Initialize: `npx @biomejs/biome init`
3. Copy optimized config from `assets/biome.json`
4. Update `next.config.js` using `assets/next.config.biome.js` as template
5. Add scripts to `package.json`:
   ```json
   {
     "scripts": {
       "format": "biome format --write .",
       "lint": "biome lint --write .",
       "check": "biome check --write ."
     }
   }
   ```

**VS Code integration (optional):**
- Copy `assets/vscode-settings.json` to `.vscode/settings.json`
- Instruct user to install Biome extension

### Step 4: Set Up Vercel Feature Flags (if requested)

**CRITICAL:** This is where Claude frequently hallucinates old patterns. **Always consult** `references/vercel-flags-implementation.md` for current implementation.

**Key facts from references:**
- Package name is `flags` (not `@vercel/flags` anymore)
- Import from `flags/next` (not `@vercel/flags/next`)
- API route must be at `app/.well-known/vercel/flags/route.ts`

**Implementation steps:**

#### 4a. Install Packages
```bash
# Flags SDK
pnpm add flags

# Vercel Toolbar (for development testing)
pnpm add @vercel/toolbar
```

#### 4b. Configure Vercel Toolbar in next.config.ts

Add the Toolbar plugin wrapper:
```typescript
import createWithVercelToolbar from '@vercel/toolbar/plugins/next';

const nextConfig: NextConfig = {
  // ... your config
};

const withVercelToolbar = createWithVercelToolbar();
export default withVercelToolbar(nextConfig);
```

**Optional:** If accessing dev server through Cloudflare tunnel/ngrok (HTTPS proxy), add `allowedDevOrigins`:
```typescript
const nextConfig: NextConfig = {
  allowedDevOrigins: ['your-tunnel-domain.example.com'],
  // ... other config
};
```

See `references/vercel-flags-implementation.md` "Remote Dev Environments" section for details.

#### 4c. Generate FLAGS_SECRET
```bash
node -e "console.log(crypto.randomBytes(32).toString('base64url'))"
```

Create `.env.local` using `assets/.env.local.example` as template, add generated secret.

#### 4d. Create Flags Definition File
Use `assets/flags-example.ts` as reference. Create at `flags.ts` (or `lib/flags.ts`):
```typescript
import { flag } from 'flags/next';

export const exampleFlag = flag({
  key: 'example-flag',
  decide: () => false,
});
```

#### 4e. Create API Route
Use `assets/flags-route.ts` as template. Create at `app/.well-known/vercel/flags/route.ts`:
```typescript
import { getProviderData, createFlagsDiscoveryEndpoint } from 'flags/next';
import * as flags from '@/flags'; // Update path

export const GET = createFlagsDiscoveryEndpoint(async () => {
  return getProviderData(flags);
});
```

**Path must be exact:** `.well-known/vercel/flags/route.ts`

#### 4f. Verification
- Confirm `FLAGS_SECRET` in `.env.local`
- Verify flags file created
- Verify API route exists at correct path
- Suggest testing with dev server

### Step 5: Enable Cache Components (if requested)

Use `references/cache-components-guide.md` (per Required Reading) for complete documentation.

Cache Components is Next.js 16's flagship caching feature - explicit opt-in caching with the `use cache` directive.

#### 5a. Enable in next.config.ts

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
};

export default nextConfig;
```

Or use `assets/next.config.cache.ts` as a template with custom cacheLife profiles.

#### 5b. Basic Usage Example

```typescript
import { cacheLife, cacheTag } from 'next/cache';

export default async function BlogPosts() {
  'use cache';
  cacheLife('hours');
  cacheTag('posts');

  const posts = await fetchPosts();
  return <PostList posts={posts} />;
}
```

#### 5c. Key Concepts to Explain

- `'use cache'` - Marks component/function as cacheable
- `cacheLife()` - Sets cache duration (built-in profiles: `'minutes'`, `'hours'`, `'days'`, `'weeks'`, `'max'`)
- `cacheTag()` - Tags cached data for targeted invalidation
- `updateTag()` - Immediate revalidation (Server Actions only)
- `revalidateTag(tag, profile)` - Background revalidation (new signature!)

### Step 6: Optional Enhancements

#### Strict TypeScript (if requested)
Use `assets/tsconfig.strict.json` as reference. Merge strict options into existing `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    // ... other strict options from asset
  }
}
```

#### Git Initialization
If `--disable-git` wasn't used, verify:
```bash
git status
```
If no repo, initialize:
```bash
git init
git add .
git commit -m "Initial Next.js 16 setup with [tooling list]"
```

## 2. Existing Project Setup

### Step 1: Detect Current State

**Always start by reading these files:**
1. `package.json` — Check dependencies, scripts, package manager
2. `next.config.js` or `next.config.ts` — Check current config
3. `tsconfig.json` — Verify TypeScript setup
4. `.eslintrc.json` or `biome.json` — Check current linter

**Use Bash to verify:**
```bash
ls -la | grep -E "package.json|next.config|biome.json|\.eslintrc"
```

**Key questions to answer:**
- Is Tailwind CSS installed? (required for shadcn)
- What linter is currently used? (ESLint vs Biome)
- Is this App Router or Pages Router?
- What package manager? (check `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`)

### Step 2: Add Requested Tooling

Follow the same procedures as "New Project Setup" but with **conflict checking**:

#### Adding Biome to ESLint Project
1. **Ask user first:** "You currently have ESLint configured. Replace with Biome or keep both?"
2. If replacing:
   - Remove ESLint packages
   - Delete `.eslintrc.json`
   - Install Biome
   - Update `next.config.js` to disable ESLint
3. If keeping both:
   - Warn about potential conflicts
   - Suggest using Biome only (simpler)

#### Adding shadcn to Non-Tailwind Project
1. **Check for Tailwind:**
   ```bash
   grep -q "tailwindcss" package.json
   ```
2. If missing:
   - Inform user Tailwind is required
   - Offer to install Tailwind first:
     ```bash
     pnpm add -D tailwindcss postcss autoprefixer
     npx tailwindcss init -p
     ```
   - Configure `tailwind.config.ts` for Next.js
3. Then proceed with shadcn init

#### Adding Vercel Flags to Existing App
Same as new project, but:
- Check if `flags` or `@vercel/flags` already installed
- If old `@vercel/flags` found, suggest migration (see reference docs)
- Verify no conflicting API routes at `.well-known/vercel/flags/`
- Check if `FLAGS_SECRET` already exists in `.env.local`

### Step 3: Incremental Validation

After each addition:
1. Run the related command to verify:
   - Biome: `pnpm biome check .`
   - shadcn: `ls components/ui/`
   - Flags: Check for API route file
2. Run dev server briefly: `pnpm dev` (then Ctrl+C)
3. Look for errors in output

## 3. Auditing Existing Next.js 16 Projects

### When to Audit

Trigger audit workflow when user:
- Asks to review existing Next.js project
- Reports build failures or errors
- Wants to ensure best practices
- Upgraded to Next.js 16 and experiencing issues
- Preparing for production deployment

### Audit Workflow

#### Step 1: Check Next.js Version and Router Type

**Verify Next.js version:**
```bash
grep '"next"' package.json
```

**Check router type:**
```bash
ls -la app/ pages/ 2>/dev/null
```

**Questions to answer:**
- [ ] Is this Next.js 16+?
- [ ] Using App Router or Pages Router?
- [ ] Are dependencies up to date?

#### Step 2: Next.js 16 Breaking Changes Check

Use `references/nextjs-16-cli-reference.md` (per Required Reading) for breaking changes.

**Common breaking changes to check:**

**Async Request APIs:**
```bash
grep -r "params\|searchParams\|cookies()\|headers()\|draftMode()" app/ --include="*.tsx" --include="*.ts" | head -20
```

**Check for missing await:**
- ❌ `const { id } = params` (Next.js 15 pattern)
- ✅ `const { id } = await params` (Next.js 16 required)

**Search for unawaited usage:**
```typescript
// INCORRECT (Next.js 16)
export default function Page({ params }) {
  const { id } = params;  // ❌ Missing await
  return <div>{id}</div>;
}

// CORRECT (Next.js 16)
export default async function Page({ params }) {
  const { id } = await params;  // ✅ Awaited
  return <div>{id}</div>;
}
```

**Check cookies/headers:**
```typescript
// INCORRECT (Next.js 16)
const cookieStore = cookies();

// CORRECT (Next.js 16)
const cookieStore = await cookies();
```

**Check for middleware.ts (deprecated):**
```bash
ls -la middleware.ts middleware.js 2>/dev/null
```

If found, recommend migration to `proxy.ts`. See `references/proxy-migration-guide.md`.

**Check for old revalidateTag usage:**
```bash
grep -r "revalidateTag(" app/ --include="*.ts" --include="*.tsx" | grep -v "revalidateTag.*," | head -10
```

Single-argument `revalidateTag('tag')` is deprecated. Should be `revalidateTag('tag', 'max')` or use `updateTag()` in Server Actions.

#### Step 3: Biome Configuration Audit

**If using Biome:**

**Check for biome.json:**
```bash
ls -la biome.json biome.jsonc
```

**→ See** `references/biome-nextjs-guide.md` or invoke **biome** skill for comprehensive audit.

**Key checks:**
- [ ] Biome version pinned with `-E` flag?
- [ ] `next.config.js` disables ESLint (`ignoreDuringBuilds: true`)?
- [ ] VS Code settings configured?
- [ ] Package.json has correct scripts?
- [ ] No conflicting ESLint config?

**Quick validation:**
```bash
pnpm biome check .
```

#### Step 4: shadcn/ui Configuration Audit

**If using shadcn/ui:**

**Check for components.json:**
```bash
cat components.json
```

**→ See** `references/shadcn-setup-guide.md` (per Required Reading).

**Validation:**
- [ ] `components.json` exists and valid?
- [ ] `lib/utils.ts` contains `cn()` function?
- [ ] `components/ui/` directory exists?
- [ ] Tailwind CSS properly configured?
- [ ] Components importing from correct paths?

**Check cn() utility:**
```bash
grep -r "cn(" lib/utils.ts
```

#### Step 5: Vercel Flags Audit

**If using Vercel feature flags:**

**CRITICAL:** Check for correct package names (common issue)

**Check package.json:**
```bash
grep -E '"flags"|"@vercel/flags"' package.json
```

**Red flags:**
- ❌ Using old `@vercel/flags` package (deprecated)
- ✅ Should use `flags` package (current)

Use `references/vercel-flags-implementation.md` (per Required Reading) — **CRITICAL for correct patterns**.

**Validation checklist:**
- [ ] Using `flags` package (not `@vercel/flags`)?
- [ ] API route at exact path: `app/.well-known/vercel/flags/route.ts`?
- [ ] FLAGS_SECRET in `.env.local`?
- [ ] Flags file exists (e.g., `flags.ts`)?
- [ ] Importing from `flags/next` (not `@vercel/flags/next`)?
- [ ] Vercel Toolbar configured in `next.config.ts`?

**Check API route:**
```bash
ls -la app/.well-known/vercel/flags/route.ts
```

**Check imports (common error):**
```bash
grep -r "@vercel/flags" . --include="*.ts" --include="*.tsx" | grep -v node_modules
```

If found, these need updating to `flags/next`.

#### Step 6: Cache Components Audit (if applicable)

**If project uses caching, check for modern patterns:**

**Check for cacheComponents enabled:**
```bash
grep -r "cacheComponents" next.config.ts next.config.js
```

**Check for use cache directive:**
```bash
grep -r "'use cache'" app/ --include="*.ts" --include="*.tsx" | head -10
```

**Check for legacy caching patterns (should migrate):**
```bash
# Old patterns that should be replaced
grep -r "export const dynamic\|export const revalidate\|fetchCache" app/ --include="*.ts" --include="*.tsx" | head -10
```

**Migration recommendations:**
- `dynamic = 'force-dynamic'` → Remove (dynamic is default now)
- `dynamic = 'force-static'` → Use `'use cache'` + `cacheLife()`
- `export const revalidate = N` → Use `cacheLife({ revalidate: N })`
- `fetchCache` → Not needed with `use cache`

See `references/cache-components-guide.md` for complete migration guide.

#### Step 7: Performance and Build Checks

**Run build to check for errors:**
```bash
pnpm build
```

**Common issues:**
- Type errors from missing awaits
- Import errors from incorrect paths
- ESLint errors (if not disabled)
- Missing environment variables

**Check for slow builds:**
- Turbopack enabled? (default in Next.js 16)
- Unnecessary dependencies?
- Large bundle sizes?

**Verify dev server:**
```bash
pnpm dev
```

Check console for warnings or errors.

#### Step 7: TypeScript Configuration

**Read tsconfig.json:**
```bash
cat tsconfig.json
```

**Check for Next.js 16 compatibility:**
- [ ] `strict: true` (recommended)?
- [ ] Correct `paths` aliases?
- [ ] `incremental: true` for faster builds?
- [ ] No conflicting settings?

**Optional: Compare against `assets/tsconfig.strict.json` for stricter settings**

### Audit Report Template

After completing audit, provide structured report:

```markdown
## Next.js 16 Project Audit Report

### Overview
- **Next.js Version:** [version]
- **Router Type:** [App Router / Pages Router]
- **Linter:** [Biome / ESLint / None]
- **UI Library:** [shadcn/ui / other / none]
- **Feature Flags:** [Vercel / other / none]

### 🔴 Critical Issues
[Build failures, breaking changes not addressed, security issues]

### 🟡 Important Improvements
[Deprecated patterns, suboptimal configs, missing best practices]

### 🟢 Recommendations
[Optional enhancements, documentation, tooling upgrades]

### ✅ Strengths
[What's done well]

### Next Steps
1. [Prioritized action items]
```

### Common Audit Findings

#### Finding: Unawaited params/searchParams

**Symptom:** Build errors about params not being a Promise

**Impact:** Build fails, runtime errors

**Fix:** Add `await` and make function `async`:
```typescript
// BEFORE
export default function Page({ params }) {
  const { id } = params;
  return <div>{id}</div>;
}

// AFTER
export default async function Page({ params }) {
  const { id } = await params;
  return <div>{id}</div>;
}
```

#### Finding: Using Old @vercel/flags Package

**Symptom:** Import errors, flags not working

**Impact:** Features broken, type errors

**Fix:**
```bash
pnpm remove @vercel/flags
pnpm add flags
```

Update all imports:
```typescript
// BEFORE
import { flag } from '@vercel/flags/next';

// AFTER
import { flag } from 'flags/next';
```

#### Finding: ESLint Conflicts with Biome

**Symptom:** Duplicate linting, conflicting rules

**Impact:** Slower builds, confusing errors

**Fix:** Update `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};
```

Remove ESLint packages:
```bash
pnpm remove eslint eslint-config-next
```

#### Finding: Incorrect Vercel Flags API Route Path

**Symptom:** Vercel Toolbar not detecting flags

**Impact:** Cannot test flags in development

**Fix:** Move API route to exact path:
```
app/.well-known/vercel/flags/route.ts
```

Must be this exact path, no variations.

#### Finding: Missing Turbopack Benefits

**Symptom:** Slow dev server, slow Fast Refresh

**Impact:** Poor DX, wasted time

**Check:** Turbopack is default in Next.js 16, verify it's active:
```bash
pnpm dev
# Should see "Turbopack" in startup logs
```

If not, check for conflicting webpack configs.

#### Finding: Using middleware.ts (Deprecated)

**Symptom:** Deprecation warning in console

**Impact:** Will break in future Next.js version

**Fix:** Run codemod to migrate:
```bash
npx @next/codemod@canary middleware-to-proxy .
```

Or manually rename `middleware.ts` → `proxy.ts` and function `middleware` → `proxy`.

#### Finding: Legacy Caching Patterns

**Symptom:** Using `export const revalidate`, `dynamic = 'force-static'`, or `fetchCache`

**Impact:** Missing Cache Components benefits, less control

**Fix:** Enable Cache Components and migrate:
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  cacheComponents: true,
};
```

Replace legacy patterns:
- `export const revalidate = 3600` → `'use cache'` + `cacheLife({ revalidate: 3600 })`
- `dynamic = 'force-static'` → `'use cache'` + `cacheLife('hours')`
- `fetchCache` → Remove (automatic with `use cache`)

#### Finding: Old revalidateTag() Signature

**Symptom:** `revalidateTag('tag')` with single argument

**Impact:** Deprecated pattern, will require change

**Fix:**
```typescript
// For background revalidation (eventual consistency)
revalidateTag('posts', 'max');

// For immediate revalidation in Server Actions (read-your-writes)
updateTag('posts');
```

## 4. Common Edge Cases

### ESLint Conflicts with Biome
**Symptom:** User reports both ESLint and Biome running, conflicts.

**Solution:**
1. Read `next.config.js`
2. Ensure `eslint: { ignoreDuringBuilds: true }` present
3. Check `package.json` scripts — remove ESLint commands
4. Verify no ESLint extension interfering in VS Code

### shadcn Init Fails on Existing Project
**Symptom:** `npx shadcn init` hangs or fails.

**Common causes:**
- Missing Tailwind CSS → Install it first
- Incompatible TypeScript version → Check `tsconfig.json`
- npm peer dependency issues → Suggest using `pnpm` or `--legacy-peer-deps`

**Solution:**
1. Verify prerequisites
2. Use `--force` flag to overwrite: `npx shadcn@latest init -y --force`
3. If still fails, check `components.json` format manually

### FLAGS_SECRET Not Working
**Symptom:** Vercel Toolbar doesn't show flags.

**Checklist:**
1. Verify `FLAGS_SECRET` in `.env.local` (correct format)
2. Check API route at exact path: `app/.well-known/vercel/flags/route.ts`
3. Confirm flags file imported correctly in API route
4. Restart dev server after adding `FLAGS_SECRET`
5. Check browser console for fetch errors

### Next.js 16 Compatibility
**Symptom:** Build errors about async params or removed APIs.

**Next.js 16 changes:**
- `params` and `searchParams` must be awaited
- `cookies()`, `headers()`, `draftMode()` must be awaited
- No more `next lint` — use ESLint or Biome directly
- Minimum Node.js 20.9

**Solution:**
- Consult `references/nextjs-16-cli-reference.md` for migration notes
- Update async patterns in components
- Check Node.js version: `node --version`

## 4. Reference Documentation

All references contain **factual, current information as of December 2025**. Always consult before implementing:

### references/cache-components-guide.md (NEW - HIGH PRIORITY)
- Complete `use cache` directive documentation
- `cacheLife()` function with built-in profiles
- `cacheTag()` for targeted invalidation
- **New APIs:** `updateTag()` and `refresh()`
- **Updated:** `revalidateTag()` signature change
- Migration from legacy caching patterns

**When to read:** Before implementing any caching in Next.js 16. This is the flagship feature.

### references/proxy-migration-guide.md (NEW)
- Migration from `middleware.ts` to `proxy.ts`
- Codemod usage
- Common proxy patterns (auth, redirects, headers)
- Node.js runtime features
- Matcher configuration

**When to read:** When project has `middleware.ts` or needs request interception.

### references/nextjs-16-cli-reference.md
- Complete `create-next-app` CLI flags
- Non-interactive command examples
- **Complete breaking changes list** (async APIs, removals, deprecations)
- Image configuration changes
- Migration notes and codemods

**When to read:** Before running `create-next-app` or advising on Next.js 16 features.

### references/biome-nextjs-guide.md
- Biome installation and configuration
- Next.js-specific Biome setup
- Integration with `next.config.js`
- Package.json scripts
- VS Code integration
- Migration from ESLint+Prettier

**When to read:** Before installing Biome or configuring linting.

### references/shadcn-setup-guide.md
- shadcn/ui initialization (interactive and non-interactive)
- Component installation
- Dark mode setup
- Form integration with React Hook Form
- Common issues and troubleshooting

**When to read:** Before running `shadcn init` or adding components.

### references/vercel-flags-implementation.md
- **CRITICAL:** Current `flags` package usage (not old `@vercel/flags`)
- FLAGS_SECRET generation and setup
- Flag definition patterns
- API route setup for Vercel Toolbar
- Server vs client component usage
- Common pitfalls and troubleshooting

**When to read:** Before implementing feature flags. This reference prevents hallucinating old patterns.

## 5. Example Assets

Assets provide copy-paste templates that Claude can adapt:

### assets/next.config.cache.ts (NEW)
Next.js 16 config with Cache Components enabled and custom cacheLife profiles.

**Use when:** Setting up Cache Components with custom cache durations for blog, products, CMS, or user-specific content.

### assets/proxy-example.ts (NEW)
Complete proxy.ts template with common patterns (auth, redirects, headers).

**Use when:** Migrating from middleware.ts or setting up new request interception.

### assets/biome.json
Next.js-optimized Biome configuration with sensible defaults.

**Use when:** Creating or updating `biome.json` for Next.js projects.

**Note:** For comprehensive Biome setup including unsafe fixes configuration and package.json scripts, see the `biome-setup` skill.

### assets/next.config.biome.js
Next.js config template that disables ESLint checks (required when using Biome).

**Use when:** Switching from ESLint to Biome or setting up new Biome project.

### assets/next.config.toolbar.ts
Next.js config template with Vercel Toolbar plugin wrapper.

**Use when:** Setting up Vercel Toolbar for flags development testing.

### assets/.env.local.example
Environment variables template including `FLAGS_SECRET` placeholder.

**Use when:** Setting up Vercel flags or creating initial `.env.local`.

### assets/flags-route.ts
Complete API route template for Vercel Toolbar flags integration.

**Use when:** Creating `.well-known/vercel/flags/route.ts` endpoint.

### assets/flags-example.ts
Example flag definitions showing various patterns (boolean, async, environment-based).

**Use when:** Creating initial flags file or demonstrating flag patterns.

### assets/tsconfig.strict.json
Strict TypeScript configuration options.

**Use when:** User requests strict TypeScript mode or enhanced type safety.

### assets/vscode-settings.json
VS Code settings for Biome integration with format-on-save.

**Use when:** Setting up editor integration for Biome.

## 6. Adaptive Best Practices

### Read Before Writing
- Always read existing files before modifying
- Use Read tool to understand current state
- Check for existing patterns to preserve

### Merge, Don't Replace
- When updating config files, merge new settings with existing
- Preserve user customizations
- Comment changes for clarity

### Validate Incrementally
- Test each addition before moving to next
- Run relevant commands to verify (biome check, dev server)
- Catch errors early

### Handle Errors Gracefully
- If command fails, read error output carefully
- Check prerequisites (Node version, dependencies)
- Suggest alternatives (pnpm vs npm, --legacy-peer-deps)

### Ask When Uncertain
- If user's project has unusual structure, ask for clarification
- If multiple valid approaches exist, present options
- Don't guess at user preferences (src/ directory, component structure)

## 7. Common User Requests and How to Handle

### "Set up Next.js with everything"
1. Clarify what "everything" means:
   - Biome or ESLint?
   - shadcn/ui?
   - Vercel flags?
   - Strict TypeScript?
2. Use non-interactive commands for smooth setup
3. Provide summary of what was installed

### "Add shadcn to my Next.js project"
1. Detect if Tailwind installed (required)
2. Check for existing `components.json`
3. Run init with appropriate flags
4. Offer to add starter components
5. Verify `components/ui/` directory created

### "I need feature flags"
1. **Immediately consult** `references/vercel-flags-implementation.md`
2. Use exact package name: `flags`
3. Generate FLAGS_SECRET, add to `.env.local`
4. Create flags file and API route using asset templates
5. Verify path is exactly `.well-known/vercel/flags/route.ts`
6. Provide example flag usage in server component

### "Switch from ESLint to Biome"
1. **Consider biome-setup skill**: For comprehensive Biome setup including unsafe fixes, use the `biome-setup` skill
2. Confirm user wants to replace (not add)
3. Remove ESLint packages and config files
4. Install Biome with exact version pinning
5. Copy config from `assets/biome.json` or `assets/biome-nextjs.json`
6. Update `next.config.js` to disable ESLint
7. Run `biome check .` to verify
8. Add Biome scripts to `package.json` (consider including `--unsafe` for unused imports/vars)

### "My build is failing after upgrading to Next.js 16"
1. Check error message for specifics
2. Common issues:
   - `params` not awaited → Add `await`
   - ESLint running → Update `next.config.js`
   - Node.js version < 20.9 → Suggest upgrade
3. Consult `references/nextjs-16-cli-reference.md` for migration notes

## 8. Quality Checklist

Before completing a setup, verify:

### For New Projects:
- [ ] Project created with correct flags
- [ ] Package manager matches user preference
- [ ] Dependencies installed successfully
- [ ] Dev server starts without errors
- [ ] If Biome: Config file present, scripts added
- [ ] If shadcn: `components.json` exists, `cn()` utility present
- [ ] If flags: API route created, `FLAGS_SECRET` set, example flag defined
- [ ] Git initialized (unless `--disable-git` used)

### For Existing Projects:
- [ ] Detected current state accurately
- [ ] No conflicting configurations introduced
- [ ] User customizations preserved
- [ ] New tooling integrated without breaking existing setup
- [ ] All commands completed successfully
- [ ] Dev server runs after changes

### General:
- [ ] All file paths correct (especially `.well-known/vercel/flags/route.ts`)
- [ ] Package names correct (`flags`, not `@vercel/flags`)
- [ ] Import paths use project's alias (`@/` typically)
- [ ] Environment variables documented in `.env.local` or `.env.local.example`
- [ ] User informed of next steps (run dev server, install editor extensions, etc.)

## 9. Troubleshooting Decision Tree

```
Issue encountered?
├─ Command failed
│  ├─ Check Node.js version (>= 20.9 for Next.js 16)
│  ├─ Verify package manager installed
│  └─ Read error output carefully
│
├─ Linting conflicts
│  ├─ Check if both ESLint and Biome active
│  ├─ Verify next.config.js has ignoreDuringBuilds: true
│  └─ Remove conflicting linter
│
├─ shadcn/ui issues
│  ├─ Verify Tailwind CSS installed
│  ├─ Check components.json format
│  └─ Try --force flag with init
│
├─ Vercel flags not working
│  ├─ Verify FLAGS_SECRET in .env.local
│  ├─ Check API route path is exact
│  ├─ Restart dev server
│  └─ Check browser console for errors
│
└─ Build/dev server errors
   ├─ Check for async/await on params (Next.js 16)
   ├─ Verify all dependencies installed
   └─ Check for TypeScript errors
```

## When Things Don't Match Documentation

If you encounter patterns not covered in references:
1. **Stop and research** — Don't guess
2. Use WebSearch or WebFetch to find official docs
3. Update understanding, then proceed
4. Document the new pattern for future reference

The references in this skill represent October 2025 state. If newer patterns emerge, prioritize official documentation over skill references.

## Summary

This skill guides Claude to:
1. **Detect and adapt** to project state using Read/Bash tools
2. **Consult factual references** before implementing
3. **Use asset templates** as starting points
4. **Validate incrementally** after each step
5. **Handle edge cases gracefully** with fallback strategies

The goal: Enable Claude to set up Next.js 16 projects correctly using current, factual patterns — not hallucinated or outdated ones. References ground the implementation in reality; assets provide copy-paste templates; the workflow ensures adaptive, context-aware setup that handles both greenfield and existing projects.
