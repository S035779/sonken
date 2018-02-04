const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const bundle = require('./webpack.bundle.js');

var production = {
    devtool: 'source-map',
    plugins: [
      new UglifyJSPlugin({
        sourceMap: true
      }),
    ],
    performance: {
      hints: "warning",
      maxAssetSize: 1280000,
      maxEntrypointSize: 1280000,
      assetFilter: function(assetFilename) {
        return assetFilename.endsWith('.css')
          || assetFilename.endsWith('.js');
      }
    }
};
module.exports = merge(bundle, production);
