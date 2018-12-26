#!/bin/sh
ASSET=/app/assets
WORKDIR=/app/sonken

if [ ! -d $ASSET/js ]; then
    mkdir $ASSET/js
fi
cp $WORKDIR/dist/js/*.js      $ASSET/js/

if [ ! -d $ASSET/css ]; then
    mkdir $ASSET/css
fi
cp $WORKDIR/dist/css/*.css    $ASSET/css/

if [ ! -d $ASSET/images ]; then
    mkdir $ASSET/images
fi
cp $WORKDIR/dist/images/*.jpg $ASSET/images/

if [ ! -d $ASSET/fonts ]; then
    mkdir $ASSET/fonts
fi
cp $WORKDIR/dist/fonts/*.eot  $ASSET/fonts/
cp $WORKDIR/dist/fonts/*.svg  $ASSET/fonts/
cp $WORKDIR/dist/fonts/*.ttf  $ASSET/fonts/
cp $WORKDIR/dist/fonts/*.woff $ASSET/fonts/
