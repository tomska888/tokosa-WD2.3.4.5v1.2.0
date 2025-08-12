# server/Dockerfile

# 1) Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
# copy lockfile if present (the * keeps it optional)
COPY package.json package-lock.json* ./
# if lockfile exists -> npm ci, else -> npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# 2) Build
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3) Runtime
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/dist ./dist
COPY package.json package-lock.json* ./
# install only production deps; same fallback logic
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

EXPOSE 3000
CMD ["node", "dist/index.js"]
