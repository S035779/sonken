FROM ubuntu:latest
MAINTAINER M.H Mamoru Hashimoto <you@example.com>
RUN apt-get update && apt-get -y install apt-transport-https ca-certificates
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5
RUN echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.6 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.6.list
RUN apt-get update && apt-get install -y mongodb-org=3.6.3 mongodb-org-server=3.6.3 mongodb-org-shell=3.6.3 mongodb-org-mongos=3.6.3 mongodb-org-tools=3.6.3
RUN mkdir -p /data/db
EXPOSE 27017
ENTRYPOINT ["/usr/bin/mongod"]
