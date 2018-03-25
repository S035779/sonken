#!/bin/sh
ASSETS=/app/assets

if[ ! -d $ASSETS/js ]; then
    mkdir $ASSETS/js
fi
cp dist/*.bundle.js dist/*.bundle.js.map $ASSETS/js/

if[ ! -d $ASSETS/image ]; then
    mkdir $ASSETS/image
fi
cp dist/*.ico $ASSETS/image/
