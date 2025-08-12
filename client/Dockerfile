# ── Build ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

# ── Nginx ────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine
# Use your SPA config that proxies /api to server:3000
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Optional healthcheck (busybox wget exists on alpine)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
