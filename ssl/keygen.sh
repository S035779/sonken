#!/bin/sh
openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr
openssl req -new -x509 -nodes  -in server.csr -key server.key -out server.crt
