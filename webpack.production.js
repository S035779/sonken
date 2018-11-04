const webpack = require('webpack');
const merge   = require('webpack-merge');
const bundle  = require('./webpack.bundle.js');

const production = {
  mode: 'production'
, devtool: 'source-map'
, plugins: [
    new webpack.DefinePlugin({
      'process.env.PLATFORM':  JSON.stringify('web')
    , 'process.env.API_URL':   JSON.stringify('https://feedparser.alpha-one-rss.jp/api')
    , 'process.env.ASSET_URL': JSON.stringify('https://feedparser.alpha-one-rss.jp/assets')
    , 'process.env.APP_NAME':  JSON.stringify('アルファOne')
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
