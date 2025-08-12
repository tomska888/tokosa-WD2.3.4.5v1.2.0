# ── Build ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Nginx ────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine
# Replace default conf with SPA + /api reverse proxy to "server:3000"
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Optional: container self-health
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ || exit 1

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
