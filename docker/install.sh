#!/bin/sh
ASSETS=/app/assets
TIME=$(date "+%Y/%m/%dT+%T.%3N")
TODAY=$(date "+%Y%m%d")

if[-e $ASSETS/js/app.bundle.js ]; then
  mv $ASSETS/js/app.bundle.js     $ASSETS/js/app.bundle_${TODAY}.js
  mv $ASSETS/js/app.bundle.js.map $ASSETS/js/app.bundle_${TODAY}.js.map
fi

if[-e $ASSETS/js/view.bundle.js ]; then
  mv $ASSETS/js/view.bundle.js     $ASSETS/js/view.bundle_${TODAY}.js
  mv $ASSETS/js/view.bundle.js.map $ASSETS/js/view.bundle_${TODAY}.js.map
fi

if[-e $ASSETS/js/icon.bundle.js ]; then
  mv $ASSETS/js/icon.bundle.js     $ASSETS/js/icon.bundle_${TODAY}.js
  mv $ASSETS/js/icon.bundle.js.map $ASSETS/js/icon.bundle_${TODAY}.js.map
fi

cp dist/*.js $ASSETS/js/
cp dist/*.js.map $ASSETS/js/

if[-e $ASSETS/js/icon.bundle.js ]; then
  mv $ASSETS/image/favicon.ico $ASSETS/image/favicon_${TODAY}.ico
fi

cp dist/*.ico $ASSETS/image/
