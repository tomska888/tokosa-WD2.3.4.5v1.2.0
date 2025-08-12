# ── Build deps ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
# Copy only manifests to maximize layer caching
COPY package*.json ./
# Use npm install so we don't need a package-lock.json in /server
RUN npm install --no-audit --no-fund

# ── Build app (TypeScript → dist) ────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Bring in the rest of the server source
COPY . .
RUN npm run build

# ── Prod deps (omit dev) ─────────────────────────────────────────────────────
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# ── Runtime ──────────────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Self-healthcheck using Node's built-in fetch (no curl/wget needed)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000/health',{cache:'no-store'}).then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

# Copy production node_modules and built assets
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build     /app/dist         ./dist
COPY package*.json ./

# Run as non-root
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
