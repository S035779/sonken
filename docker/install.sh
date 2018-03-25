#!/bin/sh
ASSETS=/app/assets
WORKDIR=/app/sonken

if [ ! -d $ASSETS/js ]; then
    mkdir $ASSETS/js
fi
cp $WORKDIR/dist/*.bundle.js $WORKDIR/dist/*.bundle.js.map $ASSETS/js/

if [ ! -d $ASSETS/image ]; then
    mkdir $ASSETS/image
fi
cp $WORKDIR/dist/*.ico $ASSETS/image/
