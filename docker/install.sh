#!/bin/sh
ASSETS=/app/assets
WORKDIR=/app/sonken

if [ ! -d $ASSETS/js ]; then
    mkdir $ASSETS/js
fi
cp $WORKDIR/dist/app.bundle.js      $ASSETS/js/
cp $WORKDIR/dist/app.bundle.js.map  $ASSETS/js/
cp $WORKDIR/dist/icon.bundle.js     $ASSETS/js/
cp $WORKDIR/dist/icon.bundle.js.map $ASSETS/js/
cp $WORKDIR/dist/view.bundle.js     $ASSETS/js/
cp $WORKDIR/dist/view.bundle.js.map $ASSETS/js/

if [ ! -d $ASSETS/image ]; then
    mkdir $ASSETS/image
fi
cp $WORKDIR/dist/favicon.ico $ASSETS/image/
