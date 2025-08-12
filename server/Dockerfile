# ---------- deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
# pull the SERVER manifest, not the root one
COPY server/package.json server/package-lock.json* ./
# work without a lockfile too
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# ---------- build ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# copy ONLY the server source
COPY server/ .
# your server has a build script (tsc) — run it here
RUN npm run build

# ---------- runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# bring built JS and the server package.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
# keep only prod deps (works even without a lockfile)
COPY --from=build /app/node_modules ./node_modules
RUN npm prune --omit=dev || true
EXPOSE 3000
# rely on your existing start script (e.g. "node dist/index.js")
CMD ["npm","run","start"]
