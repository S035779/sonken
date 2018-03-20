const merge = require('webpack-merge');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const bundle = require('./webpack.bundle.js');

var production = {
    devtool: 'source-map',
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
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
