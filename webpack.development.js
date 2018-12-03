const webpack = require('webpack');
const merge   = require('webpack-merge');
const bundle  = require('./webpack.bundle.js');

const development = {
  mode: 'development'
, devtool: 'inline-source-map'
, devServer: {
    contentBase: './dist'
  , hot:  true
  , host: '0.0.0.0'
  , port: 8080
  , historyApiFallback: true
  , watchContentBase:   true
  , disableHostCheck:   true
  , stats: { colors: true}
  , proxy: { '*': 'http://localhost:8081' }
  }
};
module.exports = merge(bundle, development);
