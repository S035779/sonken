#!/bin/sh
ASSETS=/app/assets
mkdir $ASSETS/js $ASSETS/image
cp dist/*.bundle.js dist/*.bundle.js.map $ASSETS/js/
cp dist/*.ico $ASSETS/image/
