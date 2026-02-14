# Node.js with pnpm - Production Dockerfile
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

# Enable pnpm via corepack
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

WORKDIR /app

# ==============================================================================
# Dependencies stage - install all dependencies
# ==============================================================================
FROM base AS deps

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies for build)
# Cache mount persists pnpm store across builds
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ==============================================================================
# Builder stage - compile/bundle application
# ==============================================================================
FROM base AS builder

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
# CUSTOMIZE: Change build command if needed
RUN pnpm build

# ==============================================================================
# Production stage - minimal runtime image
# ==============================================================================
FROM base AS production

ENV NODE_ENV=production

# Create non-root user for security
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nodejs

# Install production dependencies only
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod

# Copy built application with proper ownership
# CUSTOMIZE: Adjust paths based on your build output
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Switch to non-root user
USER nodejs

# CUSTOMIZE: Set your application's port
EXPOSE 3000

# Health check
# CUSTOMIZE: Adjust endpoint and port
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# CUSTOMIZE: Set your entry point
CMD ["node", "dist/index.js"]
