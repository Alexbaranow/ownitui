# Сборка: npm run build, затем из корня проекта:
#   docker build -f deploy/Dockerfile -t ownitui .

FROM nginx:alpine

RUN rm -f /etc/nginx/conf.d/default.conf
COPY deploy/nginx-ownitui.conf /etc/nginx/conf.d/default.conf

# Angular 18+ кладёт вывод в dist/ownitui/browser
COPY dist/ownitui/browser/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
