FROM alpine:3.7
MAINTAINER M.H Mamoru Hashimoto <you@example.com>

# timezone
RUN apk add --no-cache tzdata \
  && cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
  && apk del --purge tzdata

# initialize
EXPOSE 8081
WORKDIR /app
RUN addgroup -g 1000 app && adduser -G app -u 1000 -s /bin/sh -D app \
  && mkdir /opt \
  && apk add --no-cache nodejs

# install yarn
ENV YARN_VERSION 1.5.1
RUN apk add --no-cache --virtual .depYarn curl gnupg tar \
  && set -ex \
  && for key in \
    6A010C5166006599AA17F08146C2130DFD2497F5 \
  ; do \
       gpg --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys "$key" \
    || gpg --keyserver hkp://ipv4.pool.sks-keyservers.net --recv-keys "$key" \
    || gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key" \
    || gpg --keyserver keyserver.pgp.com --recv-keys "$key" \
    || gpg --keyserver pool.sks-keyservers.net --recv-keys "$key" \
    || gpg --keyserver pgp.mit.edu --recv-keys "$key" \
  ; done \
  && curl -fSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz" \
  && curl -fSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz.asc" \
  && gpg --batch --verify "yarn-v$YARN_VERSION.tar.gz.asc" "yarn-v$YARN_VERSION.tar.gz" \
  && tar -xzf "yarn-v$YARN_VERSION.tar.gz" -C /opt \
  && ln -s /opt/"yarn-v$YARN_VERSION" /opt/yarn \
  && ln -s /opt/"yarn-v$YARN_VERSION"/bin/yarn /usr/local/bin/yarn \
  && ln -s /opt/"yarn-v$YARN_VERSION"/bin/yarn /usr/local/bin/yarnpkg \
  && rm "yarn-v$YARN_VERSION.tar.gz.asc" "yarn-v$YARN_VERSION.tar.gz" \
  && apk del .depYarn

RUN apk add --no-cache git && chown -R app:app /app

# install applications
USER app
RUN git clone https://github.com/S035779/sonken.git
COPY .env /app/sonken
RUN cd /app/sonken \
  && yarn install \
  && yarn run build:node \
  && yarn run build
CMD ["node", "dist/ssr.node.js"]
