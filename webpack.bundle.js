const Dotenv = require('dotenv-webpack');
const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin')
const common = require('./webpack.common.js');

const devMode = process.env.NODE_ENV === 'development';
console.log('devMode(web platform): ', devMode);
const bundle = {
  target: "web"
, entry: {
    app: [ 
      'webpack-hot-middleware/client?path=/__webpack_hmr'
    , './main.js' 
    ]
  }
, output: {
    path: path.resolve(__dirname, 'dist')
  , publicPath: devMode ? '/' : '/assets/'
  , filename: devMode ? 'js/[name].bundle.js' : 'js/[name].[hash].js'
  }
, optimization: {
    splitChunks: {
      cacheGroups: {
        view: {
          name: 'view'
        , test: /react|react-dom|react-router|react-router-dom|react-router-config|flux|@material-ui[\\/]core/
        , chunks: 'initial'
        , enforce: true
        }
      , icon: {
          name: 'icon'
        , test: /@material-ui[\\/]icons/
        , chunks: 'initial'
        , enforce: true
        }
      }
    }
  }
, plugins: [
    new webpack.NamedModulesPlugin()
  , new webpack.HotModuleReplacementPlugin()
  , new webpack.DefinePlugin({
      'process.env.PLATFORM': JSON.stringify('web')
    })
  , new ManifestPlugin({
      fileName: 'manifest.bundle.json'
    })
  , new MiniCssExtractPlugin({
      filename: devMode ? 'css/[name].bundle.css' : 'css/[name].[contenthash].css'
    })
  , new CleanWebpackPlugin([
      'dist/js/*'
    , 'dist/images/*'
    , 'dist/fonts/*'
    , 'dist/css/*'
    ], { verbose: false })
  , new Dotenv({ 
      path: './.env.webpack' 
    , safe: false
    , systemvars: false
    , silent: false
    })
  ]
};
module.exports = merge(common, bundle);
