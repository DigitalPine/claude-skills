/**
 * Next.js 16 Configuration with Cache Components
 *
 * This template enables Cache Components with custom cacheLife profiles.
 * Copy and adapt to your project's needs.
 */
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable Cache Components (Next.js 16 flagship feature)
  cacheComponents: true,

  // Custom cacheLife profiles (optional - built-in profiles available)
  cacheLife: {
    // Blog content - cache for a while, revalidate in background
    blog: {
      stale: 3600,      // 1 hour - serve stale while revalidating
      revalidate: 900,  // 15 minutes - trigger background refresh
      expire: 86400,    // 1 day - cache fully expires
    },

    // Product catalog - shorter cache for inventory accuracy
    products: {
      stale: 300,       // 5 minutes
      revalidate: 60,   // 1 minute
      expire: 3600,     // 1 hour
    },

    // CMS content with webhook revalidation - long cache
    cms: {
      stale: 86400 * 7,    // 1 week
      revalidate: 86400,   // 1 day
      expire: 86400 * 30,  // 30 days
    },

    // User-specific data - short cache
    user: {
      stale: 60,        // 1 minute
      revalidate: 30,   // 30 seconds
      expire: 300,      // 5 minutes
    },
  },

  // Turbopack filesystem caching (beta) - faster dev startups
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },

  // If using Biome instead of ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
