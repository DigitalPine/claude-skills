# Python with uv - Production Dockerfile
#
# Uses uv (fast modern Python package manager) for dependency management
#
# Usage:
#   docker build -t myapp .
#   docker run -p 8000:8000 myapp
#
# Customization points marked with: # CUSTOMIZE

# syntax=docker/dockerfile:1

# ==============================================================================
# Builder stage - install dependencies and build
# ==============================================================================
FROM python:3.12-slim AS builder

WORKDIR /app

# Install uv from official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Set uv environment variables
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Copy dependency files
# CUSTOMIZE: Adjust if using requirements.txt instead of pyproject.toml
COPY pyproject.toml uv.lock ./

# Create venv and install dependencies (without project itself)
# Cache mount for faster subsequent builds
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev --no-install-project

# Copy project source
COPY . .

# Install the project itself
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# ==============================================================================
# Production stage - minimal runtime
# ==============================================================================
FROM python:3.12-slim AS production

WORKDIR /app

# Python environment settings
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONFAULTHANDLER=1

# Create non-root user
RUN groupadd --system --gid 1001 appgroup && \
    useradd --system --uid 1001 --gid appgroup appuser

# Copy virtual environment from builder
COPY --from=builder --chown=appuser:appgroup /app/.venv /app/.venv

# Copy application code
# CUSTOMIZE: Adjust source directory if different
COPY --from=builder --chown=appuser:appgroup /app/src /app/src

# Add venv to PATH
ENV PATH="/app/.venv/bin:$PATH"

# Switch to non-root user
USER appuser

# CUSTOMIZE: Set your application's port
EXPOSE 8000

# Health check
# CUSTOMIZE: Adjust endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# CUSTOMIZE: Set your entry point
# Examples:
#   FastAPI: ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
#   Flask: ["gunicorn", "-b", "0.0.0.0:8000", "src.main:app"]
#   Django: ["gunicorn", "-b", "0.0.0.0:8000", "project.wsgi:application"]
CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]

# ==============================================================================
# Alternative: requirements.txt workflow (simpler projects)
# ==============================================================================
# If using requirements.txt instead of pyproject.toml:
#
# Builder stage:
#   COPY requirements.txt ./
#   RUN --mount=type=cache,target=/root/.cache/uv \
#       uv venv && uv pip install -r requirements.txt
#
# Then copy .venv to production stage as shown above
