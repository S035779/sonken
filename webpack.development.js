const webpack = require('webpack');
const merge = require('webpack-merge');
const fs = require('fs');
const path = require('path');
const bundle = require('./webpack.bundle.js');

var development = {
  devtool: 'inline-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    , 'process.env.PLATFORM': JSON.stringify('web')
    , 'process.env.API_URL':
        JSON.stringify('http://localhost:8080/api')
    , 'process.env.ASSET_URL':
        JSON.stringify('http://localhost:8080')
    }),
  ],
  devServer: {
    contentBase: './dist',
    hot: true,
    host: '0.0.0.0',
    port: 8080,
    historyApiFallback: true,
    watchContentBase: true,
    disableHostCheck: true,
    stats: {colors: true},
    proxy: {
      '*': 'http://localhost:8081'
    },
    https: {
      key: fs.readFileSync(path.join(__dirname, 'ssl/server.key')),
      cert: fs.readFileSync(path.join(__dirname, 'ssl/server.crt'))
    }
  }
};
module.exports = merge(bundle, development);
