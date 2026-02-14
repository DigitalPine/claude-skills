# Vercel Feature Flags Implementation Guide

Complete guide for implementing feature flags in Next.js using the Flags SDK. Information current as of October 2025.

## Package Overview

**Current Package Name:** `flags` (formerly `@vercel/flags`)

The Flags SDK is Vercel's free, open-source library for feature flags in Next.js and SvelteKit applications.

## Key Principles

1. **Server-Only Evaluation**: Flags only evaluate on the server, never client-side
2. **Provider Agnostic**: Works with any flag provider or none at all
3. **Framework Native**: Integrates with Next.js App Router, Pages Router, and Middleware
4. **Vercel Toolbar Integration**: Automatic override support for local/production testing

## Installation

```bash
# pnpm
pnpm add flags

# npm
npm install flags

# yarn
yarn add flags

# bun
bun add flags
```

## Environment Setup

### Generate FLAGS_SECRET

Required for Vercel Toolbar integration and flag value encryption.

```bash
# Using Node.js
node -e "console.log(crypto.randomBytes(32).toString('base64url'))"

# Or using openssl
openssl rand -base64 32
```

### Add to Environment Variables

Create or update `.env.local`:

```bash
FLAGS_SECRET="your-generated-secret-here"
```

**For Vercel deployments:**
1. Add `FLAGS_SECRET` in Vercel Dashboard → Settings → Environment Variables
2. Pull to local: `npx vercel env pull`

## Defining Feature Flags

Create a `flags.ts` file in your project (common locations: root, `lib/`, `app/`):

```typescript
import { flag } from 'flags/next';

export const showBanner = flag({
  key: 'show-banner',
  decide: () => false,
});

export const enableNewFeature = flag({
  key: 'enable-new-feature',
  decide: () => process.env.NODE_ENV === 'development',
  description: 'Enable new experimental feature',
});

export const premiumFeature = flag({
  key: 'premium-feature',
  async decide() {
    // Can use Next.js APIs
    const { cookies } = await import('next/headers');
    const userTier = (await cookies()).get('user_tier');
    return userTier?.value === 'premium';
  },
  defaultValue: false,
});
```

## Flag Configuration Options

```typescript
flag<T>({
  key: string;              // Unique identifier (required)
  decide: () => T | Promise<T>;  // Evaluation logic (required)
  defaultValue?: T;         // Fallback if decide() throws or returns undefined
  description?: string;     // Shown in Flags Explorer
  origin?: string;          // Source URL or identifier
  options?: Array<{         // Valid values for Flags Explorer UI
    label?: string;
    value: T;
  }>;
})
```

## Using Flags in Components

### Server Components (App Router)

```typescript
import { showBanner, enableNewFeature } from '@/flags';

export default async function Page() {
  const banner = await showBanner();
  const newFeature = await enableNewFeature();

  return (
    <div>
      {banner && <Banner />}
      {newFeature && <NewFeatureComponent />}
    </div>
  );
}
```

### Client Components

Flags must be evaluated in server components and passed as props:

```typescript
// app/page.tsx (Server Component)
import { ClientComponent } from './ClientComponent';
import { showBanner } from '@/flags';

export default async function Page() {
  const banner = await showBanner();
  return <ClientComponent showBanner={banner} />;
}

// ClientComponent.tsx (Client Component)
'use client';

export function ClientComponent({ showBanner }: { showBanner: boolean }) {
  return showBanner ? <Banner /> : null;
}
```

## Vercel Toolbar Integration

### 1. Install Vercel Toolbar Package

```bash
# pnpm
pnpm add @vercel/toolbar

# npm
npm install @vercel/toolbar

# yarn
yarn add @vercel/toolbar

# bun
bun add @vercel/toolbar
```

### 2. Configure Next.js with Toolbar Plugin

In `next.config.ts` (or `next.config.js`):

```typescript
import type { NextConfig } from 'next';
import createWithVercelToolbar from '@vercel/toolbar/plugins/next';

const nextConfig: NextConfig = {
  // Your existing config...
};

// Wrap config with Vercel Toolbar plugin
const withVercelToolbar = createWithVercelToolbar();
export default withVercelToolbar(nextConfig);
```

For JavaScript projects:

```javascript
const createWithVercelToolbar = require('@vercel/toolbar/plugins/next');

const nextConfig = {
  // Your existing config...
};

const withVercelToolbar = createWithVercelToolbar();
module.exports = withVercelToolbar(nextConfig);
```

### 3. Add Toolbar Component to Layout (Optional)

For more control, you can manually add the Toolbar to your root layout:

```typescript
// app/layout.tsx
import { VercelToolbar } from '@vercel/toolbar/next';

export default function RootLayout({ children }) {
  const shouldInjectToolbar = process.env.NODE_ENV === 'development';

  return (
    <html>
      <body>
        {children}
        {shouldInjectToolbar && <VercelToolbar />}
      </body>
    </html>
  );
}
```

**Note:** The plugin wrapper automatically injects the toolbar in development, so manual injection is optional.

### 4. Create Flags Discovery API Route

Create `app/.well-known/vercel/flags/route.ts`:

```typescript
import { getProviderData, createFlagsDiscoveryEndpoint } from 'flags/next';
import * as flags from '@/flags'; // Update path to your flags file

export const GET = createFlagsDiscoveryEndpoint(async () => {
  return getProviderData(flags);
});
```

**Key Details:**
- Path must be exactly `.well-known/vercel/flags/route.ts`
- `createFlagsDiscoveryEndpoint()` handles authorization automatically using `FLAGS_SECRET`
- `getProviderData()` converts flag definitions to Toolbar-compatible format

### 2. Verify Integration

1. Start dev server: `npm run dev`
2. Open app in browser
3. Vercel Toolbar should show flags in Flags Explorer
4. Toggle flags to test different states
5. Toolbar sets `vercel-flag-overrides` cookie

### Alternative: Manual API Route

If you need custom authorization logic:

```typescript
import { verifyAccess, type ApiData } from 'flags';
import { getProviderData } from 'flags/next';
import { NextResponse } from 'next/server';
import * as flags from '@/flags';

export async function GET(request: Request) {
  const access = await verifyAccess(request.headers.get('Authorization'));
  if (!access) {
    return NextResponse.json(null, { status: 401 });
  }

  return NextResponse.json<ApiData>(getProviderData(flags));
}
```

## Common Flag Patterns

### Environment-Based Flags

```typescript
export const debugMode = flag({
  key: 'debug-mode',
  decide: () => process.env.NODE_ENV === 'development',
});
```

### Cookie-Based User Flags

```typescript
import { cookies } from 'next/headers';

export const betaFeatures = flag({
  key: 'beta-features',
  async decide() {
    const cookieStore = await cookies();
    return cookieStore.get('beta_user')?.value === 'true';
  },
  defaultValue: false,
});
```

### Header-Based Targeting

```typescript
import { headers } from 'next/headers';

export const mobileOptimization = flag({
  key: 'mobile-optimization',
  async decide() {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    return /mobile/i.test(userAgent);
  },
});
```

### Percentage Rollout

```typescript
export const gradualRollout = flag({
  key: 'gradual-rollout',
  decide: () => Math.random() < 0.1, // 10% rollout
  description: '10% gradual feature rollout',
});
```

### Integration with External Providers

```typescript
import { headers } from 'next/headers';

export const providerFlag = flag({
  key: 'provider-feature',
  async decide() {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');

    // Call external service (LaunchDarkly, Statsig, etc.)
    const response = await fetch(`https://api.provider.com/flags`, {
      headers: { 'X-User-ID': userId || 'anonymous' },
    });

    const data = await response.json();
    return data.providerFeature;
  },
  defaultValue: false,
});
```

## Advanced: Precomputation

For static generation or edge caching:

```typescript
import { precompute, flag } from 'flags/next';

export const staticFlag = flag({
  key: 'static-flag',
  decide: () => true,
});

// In page or layout
export async function generateStaticParams() {
  const precomputeFlags = await precompute([staticFlag]);

  return [
    { flags: precomputeFlags },
  ];
}
```

## Toolbar Override Behavior

When Vercel Toolbar sets an override:
1. Toolbar creates `vercel-flag-overrides` cookie (encrypted with FLAGS_SECRET)
2. Next request checks cookie before calling `decide()`
3. Override value used instead of `decide()` result
4. Clear override in Toolbar to restore default behavior

## Project Structure Recommendations

### Small Projects
```
app/
  flags.ts              # All flags in one file
  .well-known/
    vercel/
      flags/
        route.ts        # Toolbar API route
```

### Large Projects
```
lib/
  flags/
    auth.ts             # Authentication-related flags
    features.ts         # Feature flags
    experiments.ts      # A/B test flags
    index.ts            # Re-exports all flags
app/
  .well-known/
    vercel/
      flags/
        route.ts        # Imports from lib/flags
```

## Migration from @vercel/flags

The package was renamed from `@vercel/flags` to `flags`. Migration is straightforward:

1. Update package.json:
   ```bash
   pnpm remove @vercel/flags
   pnpm add flags
   ```

2. Update imports:
   ```typescript
   // Before
   import { flag } from '@vercel/flags/next';

   // After
   import { flag } from 'flags/next';
   ```

3. Update API route imports:
   ```typescript
   // Before
   import { getProviderData } from '@vercel/flags/next';

   // After
   import { getProviderData } from 'flags/next';
   ```

All functionality remains identical.

## Common Pitfalls

### ❌ Calling flags in client components directly
```typescript
'use client';
import { myFlag } from '@/flags';

export function ClientComponent() {
  const value = await myFlag(); // ERROR: Flags are server-only
  return <div>{value}</div>;
}
```

### ✅ Pass evaluated flags as props
```typescript
// page.tsx (server)
import { myFlag } from '@/flags';
import { ClientComponent } from './ClientComponent';

export default async function Page() {
  const value = await myFlag();
  return <ClientComponent flagValue={value} />;
}
```

### ❌ Using parameters at call site
```typescript
const value = await myFlag(userId); // ERROR: No parameters allowed
```

### ✅ Access context inside decide()
```typescript
export const myFlag = flag({
  key: 'my-flag',
  async decide() {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    return checkUser(userId);
  },
});
```

## Troubleshooting

### Toolbar not showing flags
- Verify `FLAGS_SECRET` is set in `.env.local`
- Check API route exists at `app/.well-known/vercel/flags/route.ts`
- Ensure `getProviderData(flags)` includes your flag definitions
- Restart dev server after adding FLAGS_SECRET

### Flags not respecting Toolbar overrides
- Confirm `createFlagsDiscoveryEndpoint()` is used (handles overrides automatically)
- Check `vercel-flag-overrides` cookie is present in browser
- Verify `FLAGS_SECRET` matches between Toolbar and app

### TypeScript errors with flag values
- Ensure `decide()` return type matches flag usage
- Use explicit type parameter: `flag<boolean>({ ... })`
- Check `defaultValue` matches return type

### Remote Dev Environments (Cloudflare Tunnel, ngrok, etc.)

**Edge Case:** Accessing Next.js dev server through a proxy/tunnel instead of localhost.

**Symptoms:**
- Toolbar doesn't load or shows security/CORS errors
- Hot Module Replacement (HMR) stops working
- Browser console shows cross-origin request errors

**Root Cause:**
1. **Vercel Toolbar requires HTTPS** - Security requirement for the Toolbar to function
2. **Next.js blocks cross-origin HMR by default** - Only allows HMR from localhost

**Solution:**

Both configurations are necessary:

#### 1. Use HTTPS Access (via Tunnel)

Set up a tunnel with HTTPS:
```bash
# Cloudflare Tunnel example
cloudflared tunnel --url http://localhost:3000

# ngrok example
ngrok http 3000
```

Access your dev server via the HTTPS URL provided by the tunnel (e.g., `https://your-tunnel.example.com`).

#### 2. Configure allowedDevOrigins

Add tunnel domain to `next.config.ts` to enable HMR:

```typescript
import type { NextConfig } from 'next';
import createWithVercelToolbar from '@vercel/toolbar/plugins/next';

const nextConfig: NextConfig = {
  // Allow HMR from tunnel domain
  allowedDevOrigins: ['your-tunnel.example.com'],
  // ... other config
};

const withVercelToolbar = createWithVercelToolbar();
export default withVercelToolbar(nextConfig);
```

**Multiple origins example:**
```typescript
allowedDevOrigins: [
  'claude-reborn.artokun.io',  // Cloudflare tunnel domain
  '100.120.80.103:3001',        // Local IP address
  '*.ngrok-free.app',           // Wildcard for ngrok domains
]
```

**Why both are needed:**
- **HTTPS** enables Toolbar to load (security requirement)
- **allowedDevOrigins** allows Next.js to accept HMR requests from tunnel domain
- Without HTTPS: Toolbar won't work
- Without allowedDevOrigins: Hot-reload breaks when accessing via tunnel

**Note:** `allowedDevOrigins` is development-only. In production, Next.js automatically handles CORS appropriately.

## Resources

- Official SDK docs: https://flags-sdk.dev
- API reference: https://flags-sdk.dev/api-reference/frameworks/next
- Vercel Toolbar docs: https://vercel.com/docs/workflow-collaboration/vercel-toolbar
- GitHub repository: https://github.com/vercel/flags
