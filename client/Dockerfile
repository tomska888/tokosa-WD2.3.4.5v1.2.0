# ---------- build ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY client/package.json client/package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY client/ .
RUN npm run build

# ---------- static runtime (Nginx) ----------
# if you prefer no Nginx, keep your current runtime; this version serves /dist on :80
FROM nginx:alpine AS runtime
WORKDIR /usr/share/nginx/html
# replace default site
RUN rm -rf ./*
COPY --from=build /app/dist ./
# optional health endpoint
RUN printf 'server { listen 80; location = /healthz { return 204; } location / { try_files $uri /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
