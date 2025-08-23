# --- builder ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm i; fi
COPY . .
# Vite: npm run build -> dist ; CRA: build
RUN npm run build

# --- runtime ---
FROM nginx:1.27-alpine
# Provide our template so entrypoint envsubst can render it
COPY nginx/default.config.template /etc/nginx/templates/default.conf.template
# Copy built assets
#   - Vite: /app/dist  -> /usr/share/nginx/html
#   - CRA : /app/build -> /usr/share/nginx/html
COPY --from=build /app/dist/ /usr/share/nginx/html/
# If you use CRA instead, swap the previous line for:
# COPY --from=build /app/build/ /usr/share/nginx/html/
