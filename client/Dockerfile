# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime: Nginx serves static and proxies /api to server
FROM nginx:1.27-alpine

# Built SPA
COPY --from=builder /app/dist /usr/share/nginx/html

# Use nginx template envsubst feature
ENV NGINX_ENVSUBST_TEMPLATE_SUFFIX=.template
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d

# Our template (see next file)
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80
