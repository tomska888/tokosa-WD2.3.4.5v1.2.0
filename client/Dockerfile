# ── Build the SPA and compile TS server ──────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Install project deps for Vite build (no per-workspace lockfile required)
COPY package*.json ./
RUN npm install --no-audit --no-fund

# Copy source and build Vite app
COPY . .
RUN npm run build

# Install TS toolchain (build-stage only) + type defs
# NOTE: http-proxy-middleware v3 ships its own types
RUN npm install --no-audit --no-fund -D typescript @types/node @types/express @types/compression

# Install runtime libs needed by server.ts so the compiler can resolve imports
RUN npm install --no-audit --no-fund express compression http-proxy-middleware

# Compile the tiny Node server (server.ts -> build/server.js)
RUN npx tsc -p tsconfig.server.json

# ── Runtime image (no nginx) ────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Install only runtime deps for the tiny server
RUN npm install --no-audit --no-fund express compression http-proxy-middleware

# Copy built assets and compiled server
COPY --from=build /app/dist  ./dist
COPY --from=build /app/build ./build

ENV NODE_ENV=production
# Client’s public port (avoid 3000 collision with API container)
ENV PORT=8080
# Internal DNS name for the API container in Lightsail
ENV API_TARGET=http://server:3000

# Healthcheck hits our /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:8080/health',{cache:'no-store'}).then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

# Run as non-root
USER node
EXPOSE 8080
CMD ["node", "build/server.js"]
