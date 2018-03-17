FROM alpine:3.7
MAINTAINER M.H Mamoru Hashimoto <you@example.com>

# timezone
RUN apk add --no-cache tzdata \
  && cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
  && apk del --purge tzdata

# initialize
EXPOSE 8080
VOLUME ["/var/cache/nginx"]

# install nginx
ENV NGINX_VERSION 1.13.9
RUN set -x \
  && apk add --no-cache pcre-dev openssl-dev \
  && apk add --no-cache --virtual .depNginx build-base curl \
  && curl -SLO http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz \
  && tar xzvf nginx-$NGINX_VERSION.tar.gz \
  && cd nginx-$NGINX_VERSION \
  && ./configure \
  --with-http_ssl_module \
  --with-http_gzip_static_module \
  --prefix=/usr/share/nginx \
  --sbin-path=/usr/local/sbin/nginx \
  --conf-path=/etc/nginx/conf/nginx.conf \
  --pid-path=/var/run/nginx.pid \
  --http-log-path=/var/log/nginx/access.log \
  --error-log-path=/var/log/nginx/error.log \
  && make \
  && make install \
  && ln -sf /dev/stdout /var/log/nginx/access.log \
  && ln -sf /dev/stderr /var/log/nginx/error.log \
  && cd / \
  && rm -rf nginx-$NGINX_VERSION nginx-$NGINX_VERSION.tar.gz \
  && apk del .depNginx

# configuration files
COPY nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]
