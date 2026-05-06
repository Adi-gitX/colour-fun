# =============================================================================
# Atlas — root-context multi-stage container build.
#
# Stage 1 — Node builder. Installs deps with a clean lockfile, compiles the
#           Vite SPA into ./dist.
# Stage 2 — nginx-unprivileged runtime. Non-root, listens on 8080, serves the
#           static dist/ with the SPA-fallback nginx config.
#
# The CI workflow under .github/workflows/deploy.yml runs `docker build .`
# from the repo root and pushes the resulting image to ECR.
# =============================================================================

# ---- Stage 1: build ---------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Lockfile-first copy = better Docker layer cache: deps only re-install when
# the lockfile actually changes.
COPY solid-colour/package.json solid-colour/package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY solid-colour/. ./
RUN npm run build

# ---- Stage 2: runtime -------------------------------------------------------
FROM nginxinc/nginx-unprivileged:1.27-alpine

# Reuse the same hardened nginx config the existing solid-colour image uses.
COPY solid-colour/nginx.conf /etc/nginx/conf.d/default.conf

# Drop in just the built artifacts — no Node, no source, no toolchain.
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

# nginx-unprivileged's default CMD already starts nginx in the foreground,
# so we don't need to override it.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1
