# Multi-stage: сборка Angular в контейнере, затем nginx.
# На VPS достаточно git + Docker — не нужны Node/npm.

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# Angular кладёт вывод в dist/ownitui/browser или dist/ownitui
RUN mkdir -p /out && (cp -r dist/ownitui/browser/. /out/ 2>/dev/null || cp -r dist/ownitui/. /out/)

FROM nginx:alpine
RUN rm -f /etc/nginx/conf.d/default.conf
COPY deploy/nginx-ownitui.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /out /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
