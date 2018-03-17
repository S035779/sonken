FROM ubuntu:16.04
MAINTAINER M.H Mamoru Hashimoto <you@example.com>

# debconf non-interactive mode
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && apt-get -y install --no-install-recommends apt-utils

# timezone
RUN apt-get install -y tzdata \
  && cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
  && dpkg-reconfigure --frontend noninteractive tzdata

# initialize
EXPOSE 27017
RUN mkdir -p /data/db

# install mongodb.
ENV LIST_VERSION 3.6
ENV RELEASE_VERSION 3
RUN apt-get -y install apt-transport-https ca-certificates \
  && set -ex \
  && apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 \
    --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5 \
  && echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/$LIST_VERSION multiverse" \
    | tee /etc/apt/sources.list.d/mongodb-org-$LIST_VERSION.list \
  && apt-get update \
  && apt-get install -y \
     mongodb-org=$LIST_VERSION.$RELEASE_VERSION \
     mongodb-org-server=$LIST_VERSION.$RELEASE_VERSION \
     mongodb-org-shell=$LIST_VERSION.$RELEASE_VERSION \
     mongodb-org-mongos=$LIST_VERSION.$RELEASE_VERSION \
     mongodb-org-tools=$LIST_VERSION.$RELEASE_VERSION \
  && rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["/usr/bin/mongod"]
