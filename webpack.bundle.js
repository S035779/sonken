const merge = require('webpack-merge');
const path = require('path');
const dotenv = require('dotenv-webpack');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin')
const common = require('./webpack.common.js');

var web = {
  target: "web",
  entry: {
    vendor: [
      'react',
      'react-dom',
      'react-router',
      'react-router-dom',
      'react-router-config',
      'material-ui'
    ],
    app: [
      'react-hot-loader/patch',
      './main.js',
    ],
  },
  plugins: [
    new dotenv(),
    new ManifestPlugin({ fileName: 'manifest.bundle.json' }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: Infinity,
    }),
    new CleanWebpackPlugin([
      'dist/*.bundle.*',
    ], { verbose: false, }),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
};
module.exports = merge(common, web);
