# Go Pre-Built Binary Pattern
# Use when: Building on Apple Silicon for linux/amd64 targets
# Why: Docker buildx QEMU emulation segfaults with Go 1.24+
#
# Build the binary FIRST (native cross-compilation):
#   GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w" -o app-linux-amd64 .
#
# Then build image:
#   docker buildx build --platform linux/amd64 -t myimage:latest --push .

FROM alpine:latest

WORKDIR /app

# Copy pre-built binary (built outside Docker via native cross-compilation)
COPY app-linux-amd64 ./app

# Make executable and create non-root user
RUN chmod +x ./app && \
    addgroup -S appgroup && adduser -S appuser -G appgroup

# Security: run as non-root
USER appuser

# Common ports - adjust as needed
EXPOSE 3000

# Adjust command to match your app
CMD ["./app", "serve"]
