# Proxy Migration Guide (middleware.ts → proxy.ts)

Complete guide for migrating from `middleware.ts` to `proxy.ts` in Next.js 16. The middleware file has been renamed to clarify the network boundary.

## Why the Rename?

**Previous confusion:** "Middleware" was often confused with Express.js middleware, leading to misuse. Developers sometimes treated it as a general-purpose request handler.

**Clarification:** The term "proxy" accurately describes what this file does:
- Sits at the network boundary in front of your app
- Can rewrite, redirect, or modify requests before they reach your application
- Runs on the Node.js runtime (not Edge in Next.js 16)

**Bottom line:** Same capabilities, clearer name.

## Quick Migration

### Automatic (Recommended)

Run the codemod:

```bash
npx @next/codemod@canary middleware-to-proxy .
```

This automatically:
- Renames `middleware.ts` → `proxy.ts`
- Renames the exported function from `middleware` to `proxy`
- Updates any imports

### Manual

1. Rename the file:
   ```bash
   mv middleware.ts proxy.ts
   # or
   mv middleware.js proxy.js
   ```

2. Rename the exported function:

   ```typescript
   // Before (middleware.ts)
   export function middleware(request: NextRequest) {
     return NextResponse.next();
   }

   // After (proxy.ts)
   export function proxy(request: NextRequest) {
     return NextResponse.next();
   }
   ```

   Or if using default export:

   ```typescript
   // Before
   export default function middleware(request: NextRequest) { }

   // After
   export default function proxy(request: NextRequest) { }
   ```

## File Location

The proxy file should be at the same level as `app/` or `pages/`:

```
project-root/
├── app/
├── proxy.ts      # Here (project root)
└── next.config.ts

# Or with src directory:
project-root/
├── src/
│   ├── app/
│   └── proxy.ts  # Inside src/
└── next.config.ts
```

**Only one proxy file per project.** You can organize logic into separate modules and import them.

**Note:** If using custom `pageExtensions` in `next.config.ts`, name the file accordingly (e.g., `proxy.page.ts`).

## Basic Proxy Examples

### Redirect Example

```typescript
// proxy.ts
import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  // Redirect old URLs
  if (request.nextUrl.pathname === '/old-page') {
    return NextResponse.redirect(new URL('/new-page', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/old-page',
};
```

### Authentication Check

```typescript
// proxy.ts
import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('auth-token');

  // Protect /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
};
```

### Rewrite Example

```typescript
// proxy.ts
import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  // A/B test: rewrite to different page variant
  const variant = request.cookies.get('ab-variant')?.value || 'a';

  if (request.nextUrl.pathname === '/landing') {
    return NextResponse.rewrite(
      new URL(`/landing-${variant}`, request.url)
    );
  }

  return NextResponse.next();
}
```

### Add Headers

```typescript
// proxy.ts
import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Add request ID for tracing
  response.headers.set('X-Request-ID', crypto.randomUUID());

  return response;
}
```

## Matcher Configuration

Control which routes the proxy runs on:

### String Patterns

```typescript
export const config = {
  matcher: '/api/:path*',
};
```

### Multiple Patterns

```typescript
export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
};
```

### Regex Patterns

```typescript
export const config = {
  matcher: [
    // Match all except static files and api
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
```

### Conditional Matching

```typescript
export const config = {
  matcher: [
    {
      source: '/dashboard/:path*',
      has: [
        { type: 'cookie', key: 'authorized', value: 'true' },
      ],
      missing: [
        { type: 'header', key: 'x-skip-proxy' },  // Must NOT have this header
      ],
      locale: false,  // Ignore locale-based routing
    },
  ],
};
```

## Node.js Runtime

In Next.js 16, proxy runs on **Node.js runtime** by default (previously Edge).

**Benefits:**
- Full Node.js API access
- Use any npm package (bcrypt, database clients, etc.)
- No Edge Runtime limitations

**Example using Node.js features:**

```typescript
// proxy.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

const API_KEY_HASH = process.env.API_KEY_HASH!;

export async function proxy(request: NextRequest) {
  // Validate API key with bcrypt (requires Node.js)
  const apiKey = request.headers.get('x-api-key');

  if (request.nextUrl.pathname.startsWith('/api/protected')) {
    if (!apiKey || !(await bcrypt.compare(apiKey, API_KEY_HASH))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/protected/:path*',
};
```

## Organizing Proxy Logic

For complex proxies, organize into modules:

```
lib/
  proxy/
    auth.ts
    logging.ts
    security-headers.ts
    index.ts
proxy.ts
```

```typescript
// lib/proxy/auth.ts
import { NextRequest, NextResponse } from 'next/server';

export function handleAuth(request: NextRequest): NextResponse | null {
  const token = request.cookies.get('token');
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return null; // Continue to next handler
}
```

```typescript
// lib/proxy/security-headers.ts
import { NextResponse } from 'next/server';

export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  return response;
}
```

```typescript
// proxy.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleAuth } from './lib/proxy/auth';
import { addSecurityHeaders } from './lib/proxy/security-headers';

export function proxy(request: NextRequest) {
  // Check auth first
  const authResponse = handleAuth(request);
  if (authResponse) return authResponse;

  // Continue with security headers
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}
```

## Deprecation Timeline

- **Next.js 16:** `middleware.ts` works but shows deprecation warning
- **Future version:** `middleware.ts` will be removed entirely

Migrate now to avoid breaking changes.

## Common Patterns Updated for proxy.ts

### Internationalization (i18n)

```typescript
// proxy.ts
import { NextRequest, NextResponse } from 'next/server';
import Negotiator from 'negotiator';
import { match } from '@formatjs/intl-localematcher';

const locales = ['en', 'de', 'fr'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  const headers = { 'accept-language': request.headers.get('accept-language') || '' };
  const languages = new Negotiator({ headers }).languages();
  return match(languages, locales, defaultLocale);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if pathname has locale
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  // Redirect to locale-prefixed path
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
};
```

### Background Operations with waitUntil

Run async operations after the response without blocking:

```typescript
// proxy.ts
import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';

export function proxy(request: NextRequest, event: NextFetchEvent) {
  // Send analytics without blocking response
  event.waitUntil(
    fetch('https://analytics.example.com', {
      method: 'POST',
      body: JSON.stringify({
        pathname: request.nextUrl.pathname,
        timestamp: Date.now(),
      }),
    })
  );

  return NextResponse.next();
}
```

### Rate Limiting

```typescript
// proxy.ts
import { NextRequest, NextResponse } from 'next/server';

const rateLimit = new Map<string, { count: number; timestamp: number }>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

export function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const now = Date.now();

  const record = rateLimit.get(ip);
  if (!record || now - record.timestamp > WINDOW_MS) {
    rateLimit.set(ip, { count: 1, timestamp: now });
    return NextResponse.next();
  }

  if (record.count >= MAX_REQUESTS) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  record.count++;
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

## Troubleshooting

### Proxy not running

- Check file is named `proxy.ts` (not `middleware.ts`)
- Verify file location (same level as `app/` or `pages/`)
- Check `matcher` config includes your routes

### Import errors

- Proxy runs in Node.js environment
- All npm packages should work
- If using Edge-only packages, they may not work

### Performance concerns

- Proxy runs on every matched request
- Keep logic fast and simple
- Use matcher to limit which routes trigger proxy
- Heavy operations should be in route handlers, not proxy

## Resources

- [Proxy Documentation](https://nextjs.org/docs/app/getting-started/proxy)
- [Proxy API Reference](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
- [Migration Message](https://nextjs.org/docs/messages/middleware-to-proxy)
