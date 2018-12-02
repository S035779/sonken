const webpack        = require('webpack');
const merge          = require('webpack-merge');
const Dotenv         = require('dotenv-webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const bundle         = require('./webpack.bundle.js');

const production = {
  mode: 'none'
, devtool: 'source-map'
, optimization: { nodeEnv: false }
, plugins: [
    new Dotenv({
      path: './.env.webpack'
    , safe: false
    , systemvars: false
    , silent: false
    })
  , new UglifyJSPlugin({ cache: true, parallel: true, sourceMap: true })
  ]
, performance: {
    hints: "warning"
  , maxAssetSize: 7680000
  , maxEntrypointSize: 10240000
  , assetFilter: function(assetFilename) {
      return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
    }
  }
};
module.exports = merge(bundle, production);
