#!/bin/sh
ROOT=/app
ASSET=/app/assets
WORKDIR=/app/sonken

if [ ! -d $ASSET/js ]; then
    mkdir $ASSET/js
fi
cp $WORKDIR/dist/app.bundle.js      $ASSET/js/
cp $WORKDIR/dist/icon.bundle.js     $ASSET/js/
cp $WORKDIR/dist/view.bundle.js     $ASSET/js/
cp $WORKDIR/dist/app.bundle.js.map  $ASSET/js/
cp $WORKDIR/dist/icon.bundle.js.map $ASSET/js/
cp $WORKDIR/dist/view.bundle.js.map $ASSET/js/

if [ ! -d $ASSET/css ]; then
    mkdir $ASSET/css
fi
cp $WORKDIR/dist/app.bundle.css     $ASSET/css/
cp $WORKDIR/dist/app.bundle.css.map $ASSET/css/

if [ ! -d $ASSET/image ]; then
    mkdir $ASSET/image
fi
cp $WORKDIR/dist/favicon.ico        $ASSET/image/
cp $WORKDIR/dist/*.jpg              $ASSET/image/

cp $WORKDIR/dist/*.woff             $ROOT/
cp $WORKDIR/dist/*.woff2            $ROOT/
