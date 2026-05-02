# syntax=docker/dockerfile:1.7

# ---------- Stage 1: build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifests first for better layer cache reuse on dep-only changes.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ---------- Stage 2: serve (non-root nginx) ----------
# nginx-unprivileged runs as nginx user on port 8080 by default — no
# CAP_NET_BIND or root needed.
FROM nginxinc/nginx-unprivileged:1.27-alpine

USER root
COPY nginx.conf /etc/nginx/conf.d/default.conf
USER nginx

COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/ > /dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
