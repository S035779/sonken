#!/bin/sh
ASSETS=/app/assets
TODAY=$(date "+%Y%m%d")

mv $ASSETS/js/app.bundle.js        $ASSETS/js/app.bundle_${TODAY}.js
mv $ASSETS/js/app.bundle.js.map    $ASSETS/js/app.bundle_${TODAY}.js.map
mv $ASSETS/js/view.bundle.js        $ASSETS/js/view.bundle_${TODAY}.js
mv $ASSETS/js/view.bundle.js.map    $ASSETS/js/view.bundle_${TODAY}.js.map
mv $ASSETS/js/icon.bundle.js        $ASSETS/js/icon.bundle_${TODAY}.js
mv $ASSETS/js/icon.bundle.js.map    $ASSETS/js/icon.bundle_${TODAY}.js.map
cp dist/*.js $ASSETS/js/
cp dist/*.js.map $ASSETS/js/

mv $ASSETS/image/favicon.ico $ASSETS/image/favicon_${TODAY}.ico
cp dist/*.ico $ASSETS/image/
