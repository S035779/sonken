const webpack = require('webpack');
const merge   = require('webpack-merge');
const Dotenv  = require('dotenv-webpack');
const bundle  = require('./webpack.bundle.js');

const production = {
  mode: 'production'
, devtool: 'source-map'
, plugins: [
    new Dotenv({
      path: './.env.production'
    , safe: false
    , systemvars: false
    , silent: false
    })
  ]
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
