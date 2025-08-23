# ---------- build ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm i; fi
COPY . .
RUN npm run build

# ---------- runtime ----------
FROM nginx:1.27-alpine
# Tell the official nginx image to render templates from /etc/nginx/templates/*.template
# into /etc/nginx/conf.d/*.conf using envsubst at container start.
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d

# ⬇️ Correct filename: default.conf.template (not default.config.template)
COPY ./nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Ship the built SPA
COPY --from=build /app/dist /usr/share/nginx/html
