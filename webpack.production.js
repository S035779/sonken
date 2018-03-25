const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const bundle = require('./webpack.bundle.js');

var production = {
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    , 'process.env.PLATFORM': JSON.stringify('web')
    , 'process.env.API_URL':  JSON.stringify('http://35.200.100.73/api')
    }),
    new UglifyJSPlugin({
      sourceMap: true
    }),
  ],
  performance: {
    hints: "warning",
    maxAssetSize: 2560000,
    maxEntrypointSize: 5120000,
    assetFilter: function(assetFilename) {
      return assetFilename.endsWith('.css')
        || assetFilename.endsWith('.js');
    }
  }
};
module.exports = merge(bundle, production);
