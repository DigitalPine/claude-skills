# Go Static Binary - Production Dockerfile
#
# Produces minimal image (~2-15MB) with static Go binary
#
# Usage:
#   docker build -t myapp .
#   docker run -p 8080:8080 myapp
#
# Customization points marked with: # CUSTOMIZE

# syntax=docker/dockerfile:1

# ==============================================================================
# Builder stage - compile Go application
# ==============================================================================
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install certificates (needed for scratch image HTTPS calls)
RUN apk add --no-cache ca-certificates

# Download dependencies (cached layer)
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download && go mod verify

# Copy source code
COPY . .

# Build static binary
# CGO_ENABLED=0 produces static binary without glibc dependency
# -ldflags="-s -w" strips debug info for smaller binary
# CUSTOMIZE: Change 'server' to your binary name and './cmd/server' to your main package
RUN --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o /server ./cmd/server

# ==============================================================================
# Production stage - minimal runtime
# ==============================================================================
# Option A: scratch (smallest, ~2MB, no shell)
FROM scratch AS production

# Copy CA certificates for HTTPS requests
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy timezone data (uncomment if your app needs timezone support)
# COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Copy the binary
COPY --from=builder /server /server

# CUSTOMIZE: Set your application's port
EXPOSE 8080

# Run the binary
ENTRYPOINT ["/server"]

# ==============================================================================
# Alternative: distroless (slightly larger, ~3MB, includes passwd for USER)
# ==============================================================================
# Uncomment this section and comment out the scratch section above if you need:
# - Non-root user support with proper passwd/group
# - Slightly easier debugging with :debug tag
#
# FROM gcr.io/distroless/static-debian12:nonroot AS production
# COPY --from=builder /server /server
# EXPOSE 8080
# ENTRYPOINT ["/server"]
