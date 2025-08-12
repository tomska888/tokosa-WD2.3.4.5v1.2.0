# Build the SPA
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# Use npm install to avoid requiring a package-lock in client/
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

# Run the SPA with a tiny Node server (no nginx)
FROM node:20-alpine
WORKDIR /app

# Install only the runtime deps needed for the tiny server
# (no need to add them to package.json if you prefer not to touch it)
RUN npm install --no-audit --no-fund express compression http-proxy-middleware

# Copy built assets and the server script
COPY --from=build /app/dist ./dist
COPY server.js ./server.js

ENV NODE_ENV=production
ENV PORT=3000
# Internal DNS name for the server container in Lightsail
ENV API_TARGET=http://server:3000

# Healthcheck calls our /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000/health',{cache:'no-store'}).then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

# Non-root for safety
USER node
EXPOSE 3000
CMD ["node", "server.js"]
