# Build the SPA
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# Using npm install avoids requiring a local package-lock.json
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

# Run the SPA with a tiny Node server (no nginx)
FROM node:20-alpine
WORKDIR /app

# Install only the runtime deps for the tiny server
RUN npm install --no-audit --no-fund express compression http-proxy-middleware

# Copy built assets and the server script
COPY --from=build /app/dist ./dist
COPY server.js ./server.js

ENV NODE_ENV=production
# >>> client now listens on 8080 (public)
ENV PORT=8080
# Internal DNS name for the API container in Lightsail
ENV API_TARGET=http://server:3000

# Healthcheck calls our /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:8080/health',{cache:'no-store'}).then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

# Non-root
USER node
EXPOSE 8080
CMD ["node", "server.js"]
