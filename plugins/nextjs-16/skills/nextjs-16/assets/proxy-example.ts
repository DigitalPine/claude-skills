/**
 * Next.js 16 Proxy Example (replaces middleware.ts)
 *
 * The proxy runs at the network boundary before your app.
 * In Next.js 16, it runs on Node.js runtime by default.
 *
 * File location: project-root/proxy.ts (same level as app/)
 */
import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Example 1: Authentication check
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('auth-token');
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Example 2: Redirect old URLs
  if (pathname === '/old-page') {
    return NextResponse.redirect(new URL('/new-page', request.url));
  }

  // Example 3: Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Example 4: Add request tracing header
  response.headers.set('X-Request-ID', crypto.randomUUID());

  return response;
}

// Matcher configuration - only run proxy on these routes
export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

/**
 * Alternative: Named export (both work)
 *
 * export default function proxy(request: NextRequest) { ... }
 *
 * Migration from middleware.ts:
 * 1. Rename file: middleware.ts → proxy.ts
 * 2. Rename function: middleware → proxy
 * 3. Or run: npx @next/codemod@canary middleware-to-proxy .
 */
