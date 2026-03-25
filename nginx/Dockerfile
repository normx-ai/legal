FROM nginx:alpine

RUN adduser -D -H -u 101 -s /sbin/nologin nginx || true

COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/
COPY dist/ /var/www/normx-legal/

RUN chown -R nginx:nginx /var/www/normx-legal

EXPOSE 80 443
