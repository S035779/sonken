const webpack = require('webpack');
const merge   = require('webpack-merge');
const bundle  = require('./webpack.bundle.js');

const production = {
  mode: 'production'
, devtool: 'source-map'
, performance: {
    hints: "warning"
  , maxAssetSize: 2560000
  , maxEntrypointSize: 5120000
  , assetFilter: function(assetFilename) { 
      return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
    }
  }
};
module.exports = merge(bundle, production);
