const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin')
const common = require('./webpack.common.js');

var bundle = {
  target: "web"
, entry: {
    app: [ 'react-hot-loader/patch', './main.js' ]
  }
, optimization: {
    splitChunks: {
      cacheGroups: {
        view: {
          name: 'view'
        , test: /react|react-dom|react-router|react-router-dom|react-router-config|flux|@material-ui[\\/]core/
        , chunks: 'initial'
        , enforce: true
        },
        icon: {
          name: 'icon'
        , test: /@material-ui[\\/]icons/
        , chunks: 'initial'
        , enforce: true
        }
      }
    }
  }
, plugins: [
    new ManifestPlugin({ fileName: 'manifest.bundle.json' })
  , new webpack.NamedModulesPlugin()
  , new webpack.HotModuleReplacementPlugin()
  , new CleanWebpackPlugin([
      'dist/*.bundle.*'
    , 'dist/*.jpg'
    ], { verbose: false })
  ]
, output: {
    filename: '[name].bundle.js'
  , path: path.resolve(__dirname, 'dist')
  , publicPath: '/'
  }
};
module.exports = merge(common, bundle);
