const webpack        = require('webpack');
const merge          = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const bundle         = require('./webpack.bundle.js');

const production = {
  mode: 'none'
, devtool: 'source-map'
, optimization: { nodeEnv: false }
, plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV':  JSON.stringify('staging')
    , 'process.env.PLATFORM':  JSON.stringify('web')
    , 'process.env.API_URL':   JSON.stringify('http://35.227.255.168/api')
    , 'process.env.ASSET_URL': JSON.stringify('http://35.227.255.168/assets')
    , 'process.env.APP_NAME':  JSON.stringify('SellerSearch!')
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
