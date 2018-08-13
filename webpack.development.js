const webpack = require('webpack');
const merge   = require('webpack-merge');
const bundle  = require('./webpack.bundle.js');

var development = {
  mode: 'development'
, plugins: [
    new webpack.DefinePlugin({
      'process.env.PLATFORM':  JSON.stringify('web')
    , 'process.env.API_URL':   JSON.stringify('http://localhost:8080/api')
    , 'process.env.ASSET_URL': JSON.stringify('http://localhost:8080')
    , 'process.env.APP_NAME':  JSON.stringify('RSS Reader!!')
    })
  ]
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
