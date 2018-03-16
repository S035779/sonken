FROM alpine:3.7
MAINTAINER M.H Mamoru Hashimoto <you@example.com>

# timezone
RUN apk add --no-cache tzdata \
  && cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
  && apk del --purge tzdata

# initialize
EXPOSE 8081
WORKDIR /app

# install nodejs
ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 9.8.0
RUN addgroup -g 1000 app && adduser -G app -S -D -H -u 1000 app \
  && apk add --no-cache --virtual .devDependence gnupg curl \
  && set -ex \
  && for key in \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    FD3A5288F042B6850C66B31F09FE44734EB7990E \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
    C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
    B9AE9905FFD7803F25714661B63B535A4C206CA9 \
    56730D5401028683275BD23C23EFEFE93C4CFFFE \
    77984A986EBC2AA786BC0F66B01FBB92821C587A \
  ; do gpg --keyserver pgp.mit.edu --recv-keys "$key" \
    || gpg --keyserver keyserver.pgp.com --recv-keys "$key" \
    || gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key" \
    || gpg --keyserver pool.sks-keyservers.net --recv-keys "$key"; \
  done \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz" \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --verify SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-x64.tar.gz\$" SHASUMS256.txt.asc | sha256sum -c - \
  && tar -xzf "node-v$NODE_VERSION-linux-x64.tar.gz" -C /usr/local --strip-components=1 \
  && apk del .devDependence \
  && rm "node-v$NODE_VERSION-linux-x64.tar.gz" SHASUMS256.txt.asc

# install yarn
ENV YARN_VERSION 1.5.1
RUN apk add --no-cache --virtual .devDependense curl gnupg tar \
  && for key in \
    6A010C5166006599AA17F08146C2130DFD2497F5 \
  ; do gpg --keyserver pgp.mit.edu --recv-keys "$key" \
    || gpg --keyserver keyserver.pgp.com --recv-keys "$key" \
    || gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key" \
    || gpg --keyserver pool.sks-keyservers.net --recv-keys "$key"; \
  done \
  && curl -fSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz" \
  && curl -fSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz.asc" \
  && gpg --batch --verify yarn-v$YARN_VERSION.tar.gz.asc yarn-v$YARN_VERSION.tar.gz \
  && mkdir -p /opt/yarn \
  && tar -xzf yarn-v$YARN_VERSION.tar.gz -C /opt/yarn --strip-components=1 \
  && ln -s /opt/yarn/bin/yarn /usr/local/bin/yarn \
  && ln -s /opt/yarn/bin/yarn /usr/local/bin/yarnpkg \
  && rm yarn-v$YARN_VERSION.tar.gz.asc yarn-v$YARN_VERSION.tar.gz \
  && apk del .devDependence

RUN apk add --no-cache git && chown -R app:app /app
USER app

RUN ls -al /usr/local/bin /usr/bin \
  && echo $PATH \
  && which node \
  && groups app \
  && date

RUN node --version
RUN git clone https://github.com/S035779/sonken.git
RUN cd /app/sonken \
  && npm install \
  && webpack --config webpack.production.js \
  && webpack --config webpack.node.js
CMD ["node", "dist/ssr.node.js"]
