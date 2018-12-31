const Dotenv = require('dotenv-webpack');
const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const LoadablePlugin = require('@loadable/webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin')
const common = require('./webpack.common.js');

const devMode = process.env.NODE_ENV === 'development';
console.log('devMode(web platform): ', devMode);
const bundle = {
  target: "web"
, entry: {
    app: devMode ? [ 'webpack-hot-middleware/client?path=/__what', './main.js' ] : './main.js'
  }
, output: {
    path: path.resolve(__dirname, 'dist')
  , publicPath: devMode ? '/' : '/assets/'
  , filename: devMode ? 'js/[name].bundle.js' : 'js/[name].[contenthash].js'
  }
, optimization: {
    splitChunks: {
      chunks: 'all'
    , maxInitialRequests: 20
    , maxAsyncRequests: 20
    , minSize: 0
    , cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/
        , name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `npm.${packageName.replace('@', '')}`;
          }
        }
      }
    }
  }
, plugins: [
    new webpack.HotModuleReplacementPlugin()
  , new LoadablePlugin()
  , new webpack.DefinePlugin({ 'process.env.PLATFORM': JSON.stringify('web') })
  , new ManifestPlugin({ fileName: 'manifest.bundle.json' })
  , new MiniCssExtractPlugin({ filename: devMode ? 'css/[name].bundle.css' : 'css/[name].[contenthash].css' })
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
