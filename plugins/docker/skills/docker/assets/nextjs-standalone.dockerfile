# Next.js Standalone - Production Dockerfile
#
# Uses Next.js standalone output for minimal image
# Requires: output: 'standalone' in next.config.js
#
# Usage:
#   docker build -t myapp .
#   docker run -p 3000:3000 myapp
#
# Customization points marked with: # CUSTOMIZE

# syntax=docker/dockerfile:1

# ==============================================================================
# Base stage - shared configuration
# ==============================================================================
FROM node:22-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

WORKDIR /app

# ==============================================================================
# Dependencies stage
# ==============================================================================
FROM base AS deps

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ==============================================================================
# Builder stage
# ==============================================================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application
# CUSTOMIZE: Add any build-time environment variables
# ARG NEXT_PUBLIC_API_URL
# ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm build

# ==============================================================================
# Production stage - minimal standalone image
# ==============================================================================
FROM node:22-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nodejs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone build output
# The standalone output includes only the necessary files
COPY --from=builder --chown=nodejs:nodejs /app/.next/standalone ./

# Copy static files (required for standalone mode)
COPY --from=builder --chown=nodejs:nodejs /app/.next/static ./.next/static

USER nodejs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

# Next.js standalone server
CMD ["node", "server.js"]

# ==============================================================================
# IMPORTANT: next.config.js requirement
# ==============================================================================
# Add this to your next.config.js:
#
# /** @type {import('next').NextConfig} */
# const nextConfig = {
#   output: 'standalone',
# }
# module.exports = nextConfig
#
# This enables the standalone output mode that creates a minimal production build.
