#!/bin/sh
ASSET=/usr/share/nginx/html/assets
WORKDIR=/home/app/work/sonken

if [ ! -d $ASSET/js ]; then
    mkdir $ASSET/js
fi
cp $WORKDIR/dist/app.bundle.js      $ASSET/js/
cp $WORKDIR/dist/app.bundle.js.map  $ASSET/js/
cp $WORKDIR/dist/icon.bundle.js     $ASSET/js/
cp $WORKDIR/dist/icon.bundle.js.map $ASSET/js/
cp $WORKDIR/dist/view.bundle.js     $ASSET/js/
cp $WORKDIR/dist/view.bundle.js.map $ASSET/js/

if [ ! -d $ASSET/image ]; then
    mkdir $ASSET/image
fi
cp $WORKDIR/dist/favicon.ico        $ASSET/image/
cp $WORKDIR/dist/*.jpg              $ASSET/image/

cp $WORKDIR/systemd/sonken1.service /etc/systemd/system/
cp $WORKDIR/systemd/sonken2.service /etc/systemd/system/
cp $WORKDIR/systemd/sonken3.service /etc/systemd/system/
cp $WORKDIR/systemd/nginx.conf /etc/nginx/
