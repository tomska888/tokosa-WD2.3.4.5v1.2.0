# ---- build the SPA ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
RUN npm run build

# ---- serve with nginx ----
FROM nginx:1.27-alpine
# Let the official entrypoint render templates with envsubst -> /etc/nginx/conf.d
# (this is how the official image works)
# https://hub.docker.com/_/nginx
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
