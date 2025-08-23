FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
# let entrypoint render templates
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
# Vite/React build goes to /usr/share/nginx/html
COPY --from=build /app/dist /usr/share/nginx/html
