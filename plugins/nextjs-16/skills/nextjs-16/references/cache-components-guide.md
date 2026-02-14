# Cache Components Guide for Next.js 16

Complete guide for implementing the new Cache Components model in Next.js 16. This is Next.js 16's flagship feature - a complete rethinking of caching with explicit opt-in semantics.

## Overview

Cache Components enables **Partial Prerendering (PPR)** - mixing static, cached, and dynamic content in a single route. Unlike previous App Router versions where caching was implicit and often unpredictable, Next.js 16 makes all dynamic code execute at request time by default. You explicitly opt-in to caching.

**Key principle:** Opt-in caching, not opt-out.

## Enabling Cache Components

Add to `next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
};

export default nextConfig;
```

**Note:** This replaces the old `experimental.ppr` and `experimental.dynamicIO` flags (both removed in Next.js 16).

## The `use cache` Directive

Mark components, functions, or entire files as cacheable:

### Component Level

```typescript
export default async function BlogPosts() {
  'use cache';

  const posts = await db.query('SELECT * FROM posts');
  return <PostList posts={posts} />;
}
```

### Function Level

```typescript
async function fetchPosts() {
  'use cache';
  return await db.query('SELECT * FROM posts');
}

export default async function Page() {
  const posts = await fetchPosts();
  return <PostList posts={posts} />;
}
```

### File Level

```typescript
'use cache';

// All exports in this file are cached
export async function getPosts() {
  return await db.query('SELECT * FROM posts');
}

export async function getUsers() {
  return await db.query('SELECT * FROM users');
}
```

## Cache Lifetimes with `cacheLife()`

Control how long cached data remains valid using built-in profiles or custom durations.

### Built-in Profiles

```typescript
import { cacheLife } from 'next/cache';

export default async function Page() {
  'use cache';
  cacheLife('hours');  // Use built-in profile

  const data = await fetchData();
  return <div>{/* render */}</div>;
}
```

**Available profiles:**

| Profile | Use Case |
|---------|----------|
| `'seconds'` | Real-time data (stock prices, live scores) |
| `'minutes'` | Short-lived cache (frequently changing data) |
| `'hours'` | Medium-term cache (default for most cases) |
| `'days'` | Long-term cache (stable content) |
| `'weeks'` | Very long-term cache (rarely changing) |
| `'max'` | Maximum cache duration |

**Note:** There's also an implicit `'default'` profile (stale: 5min, revalidate: 15min, expire: 1 year) used when no `cacheLife()` is called.

### Custom Duration

```typescript
import { cacheLife } from 'next/cache';

export default async function Page() {
  'use cache';
  cacheLife({
    stale: 3600,      // 1 hour - serve stale while revalidating
    revalidate: 7200, // 2 hours - trigger background refresh
    expire: 86400,    // 1 day - cache fully expires
  });

  const data = await fetchData();
  return <div>{/* render */}</div>;
}
```

**Timing properties:**

- **stale**: How long client can use cached data without checking server
- **revalidate**: After this time, next request triggers background refresh
- **expire**: After this time with no requests, cache is fully invalid

### Custom Profiles in Config

Define reusable profiles in `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    blog: {
      stale: 3600,      // 1 hour
      revalidate: 900,  // 15 minutes
      expire: 86400,    // 1 day
    },
    products: {
      stale: 300,       // 5 minutes
      revalidate: 60,   // 1 minute
      expire: 3600,     // 1 hour
    },
  },
};
```

Use in code:

```typescript
cacheLife('blog');     // Use custom profile
cacheLife('products');
```

## Cache Tags with `cacheTag()`

Tag cached data for targeted invalidation:

```typescript
import { cacheTag } from 'next/cache';

export async function getPosts() {
  'use cache';
  cacheTag('posts');
  cacheTag('content');  // Can have multiple tags

  return await db.query('SELECT * FROM posts');
}

export async function getPost(id: string) {
  'use cache';
  cacheTag('posts', `post-${id}`);  // Multiple tags in one call

  return await db.query('SELECT * FROM posts WHERE id = ?', [id]);
}
```

## Revalidation APIs

Next.js 16 has three distinct revalidation APIs for different use cases.

### `revalidateTag()` - Background Revalidation (SWR)

For eventual consistency. Marks cache as stale, next request gets fresh data.

```typescript
import { revalidateTag } from 'next/cache';

// IMPORTANT: Now requires cacheLife profile as second argument
revalidateTag('posts', 'max');      // Built-in profile
revalidateTag('posts', 'hours');    // Another built-in
revalidateTag('posts', { expire: 3600 }); // Custom expiration

// DEPRECATED: Single argument form
revalidateTag('posts'); // Still works but deprecated
```

**Use when:** Background jobs, webhooks, non-user-facing updates.

### `updateTag()` - Immediate Revalidation (Read-Your-Writes)

**NEW in Next.js 16.** For immediate consistency within the same request. User sees their changes immediately.

```typescript
'use server';

import { updateTag } from 'next/cache';

export async function createPost(formData: FormData) {
  await db.posts.insert(formData);

  // User immediately sees their new post
  updateTag('posts');
}

export async function updateUserProfile(userId: string, data: Profile) {
  await db.users.update(userId, data);

  // User immediately sees their updated profile
  updateTag(`user-${userId}`);
}
```

**Use when:** User actions where they need to see their changes immediately (forms, CRUD operations).

**Constraint:** Only available in Server Actions.

### `refresh()` - Refresh Uncached Data

**NEW in Next.js 16.** Refreshes only uncached/dynamic data without touching the cache.

```typescript
'use server';

import { refresh } from 'next/cache';

export async function markNotificationAsRead(id: string) {
  await db.notifications.markAsRead(id);

  // Refresh uncached data like notification counts
  refresh();
}
```

**Use when:** Updating dynamic data that isn't cached (counters, status indicators).

**Constraint:** Only available in Server Actions.

## Three Content Types

Cache Components creates three distinct content types:

| Type | How to Create | Behavior |
|------|---------------|----------|
| **Static** | Automatic | Pure computation, sync I/O, module imports - prerendered at build |
| **Cached** | `'use cache'` directive | Reused across requests, included in static shell |
| **Dynamic** | `<Suspense>` boundary | Fetched at request time, streams to client |

### Pattern: Static + Cached + Dynamic

```typescript
export default function Page() {
  return (
    <>
      {/* Static - prerendered automatically */}
      <header>
        <h1>My Site</h1>
        <nav>{/* static nav */}</nav>
      </header>

      {/* Cached - included in static shell */}
      <BlogPosts />

      {/* Dynamic - streams at request time */}
      <Suspense fallback={<p>Loading preferences...</p>}>
        <UserPreferences />
      </Suspense>
    </>
  );
}

async function BlogPosts() {
  'use cache';
  cacheLife('hours');
  cacheTag('posts');

  const posts = await fetchPosts();
  return <section>{/* render posts */}</section>;
}

async function UserPreferences() {
  // Uses cookies - must be dynamic
  const theme = (await cookies()).get('theme')?.value;
  return <aside>Theme: {theme}</aside>;
}
```

## Working with Runtime Data

Runtime APIs (`cookies()`, `headers()`, `searchParams`) cannot be directly cached. Two approaches:

### Approach 1: Suspense Boundary (Dynamic Content)

```typescript
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <UserContent />
    </Suspense>
  );
}

async function UserContent() {
  // Dynamic - runs at request time
  const session = (await cookies()).get('session');
  return <div>Welcome, {session?.value}</div>;
}
```

### Approach 2: Pass Values to Cached Functions

```typescript
async function ProfilePage() {
  // Extract runtime data first
  const sessionId = (await cookies()).get('session')?.value;

  // Pass to cached function - sessionId becomes part of cache key
  return <CachedProfile sessionId={sessionId} />;
}

async function CachedProfile({ sessionId }: { sessionId: string }) {
  'use cache';
  cacheLife('hours');

  // Different cache entry per sessionId
  const profile = await fetchProfile(sessionId);
  return <div>{profile.name}</div>;
}
```

## Migration from Legacy Patterns

### Remove `dynamic = 'force-dynamic'`

Not needed - all pages are dynamic by default.

```typescript
// Before (Next.js 15)
export const dynamic = 'force-dynamic';

// After (Next.js 16)
// Just remove it - dynamic is the default
```

### Replace `dynamic = 'force-static'`

```typescript
// Before (Next.js 15)
export const dynamic = 'force-static';

// After (Next.js 16)
export default async function Page() {
  'use cache';
  cacheLife('hours');
  return <div>...</div>;
}
```

### Replace `export const revalidate`

```typescript
// Before (Next.js 15)
export const revalidate = 3600;

// After (Next.js 16)
export default async function Page() {
  'use cache';
  cacheLife({ revalidate: 3600 });
  return <div>...</div>;
}
```

### Update `revalidateTag()` Calls

```typescript
// Before (Next.js 15) - DEPRECATED
revalidateTag('posts');

// After (Next.js 16) - For background revalidation
revalidateTag('posts', 'max');

// After (Next.js 16) - For immediate user feedback in Server Actions
updateTag('posts');
```

### Remove `fetchCache`

Not needed with `use cache` - all fetches in cached scope are automatically cached.

## Best Practices

### 1. Place Suspense Close to Dynamic Content

Maximize the static shell by wrapping only the dynamic parts:

```typescript
// Good - large static shell
<main>
  <StaticHeader />
  <StaticSidebar />
  <Suspense fallback={<Skeleton />}>
    <DynamicContent />
  </Suspense>
</main>

// Bad - entire page waits for dynamic content
<Suspense fallback={<Loading />}>
  <main>
    <StaticHeader />
    <StaticSidebar />
    <DynamicContent />
  </main>
</Suspense>
```

### 2. Use `updateTag()` for User Actions

When users perform actions and expect to see results immediately:

```typescript
'use server';

export async function addToCart(productId: string) {
  await db.cart.add(productId);
  updateTag('cart');  // User sees updated cart immediately
}
```

### 3. Use `revalidateTag()` for Background Updates

For webhooks, scheduled jobs, or admin actions:

```typescript
// Webhook handler
export async function POST(request: Request) {
  const data = await request.json();
  await processWebhook(data);
  revalidateTag('content', 'max');
  return Response.json({ success: true });
}
```

### 4. Tag Hierarchically

Use multiple tags for flexible invalidation:

```typescript
async function getProduct(id: string) {
  'use cache';
  cacheTag('products');           // All products
  cacheTag(`product-${id}`);      // This specific product
  cacheTag('catalog');            // Broader category

  return await fetchProduct(id);
}

// Later: invalidate just one product
updateTag(`product-${id}`);

// Or: invalidate all products
updateTag('products');
```

### 5. For CMS Content: Long Cache + Tag Revalidation

Instead of aggressive expiration, use long cache durations with webhook-triggered revalidation:

```typescript
// next.config.ts
cacheLife: {
  cms: {
    stale: 86400 * 7,    // 1 week
    revalidate: 86400,   // 1 day
    expire: 86400 * 30,  // 30 days
  },
}

// Component
async function CMSContent() {
  'use cache';
  cacheLife('cms');
  cacheTag('cms-content');
  // ...
}

// CMS webhook
revalidateTag('cms-content', 'max');
```

## Constraints

- **Node.js runtime required** - Cache Components doesn't work with Edge Runtime
- **Serialization limits** - Cached values must be serializable (no circular refs, functions, etc.)
- **Runtime data** - Cannot cache `cookies()`, `headers()`, `searchParams` directly
- **Minimum 30-second client cache** - Client-side caching enforces a 30-second minimum to keep prefetched links usable
- **50-second build timeout** - Passing runtime Promises to cached functions can cause builds to hang (50s timeout)

## Troubleshooting

### Error: Dynamic API used outside Suspense

Runtime APIs used in cached or static context:

```typescript
// Error
export default async function Page() {
  'use cache';
  const user = (await cookies()).get('user'); // Can't cache cookies
}

// Fix: Move to Suspense boundary
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <UserContent />
    </Suspense>
  );
}

async function UserContent() {
  const user = (await cookies()).get('user');
  return <div>{user?.value}</div>;
}
```

### Cache not updating after `updateTag()`

- Ensure you're in a Server Action (`'use server'`)
- Check the tag matches exactly (case-sensitive)
- Verify `cacheTag()` was called with that tag

### Different cache behavior in dev vs production

- Development may show stale data differently
- Run `next build && next start` to test production behavior
- Check `cacheLife` settings apply correctly

## Resources

- [Cache Components Config](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents)
- [use cache Directive](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [cacheLife() Function](https://nextjs.org/docs/app/api-reference/functions/cacheLife)
- [cacheTag() Function](https://nextjs.org/docs/app/api-reference/functions/cacheTag)
- [revalidateTag() Function](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
- [updateTag() Function](https://nextjs.org/docs/app/api-reference/functions/updateTag)
- [Composable Caching Blog Post](https://nextjs.org/blog/composable-caching)
