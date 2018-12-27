const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const ManifestPlugin = require('webpack-manifest-plugin');
const common = require('./webpack.common.js');

const devMode = process.env.NODE_ENV === 'development';
console.log('devMode(local platform): ', devMode);
const node = {
  target: "node"
, externals: [ nodeExternals() ]
, mode: 'none'
, entry: {
    ssr: ['./ssr-server.js']
  , api: ['./api-server.js']
  , job: ['./job-server.js']
  , wrk: ['./job-worker.js']
  , img: ['./img-server.js']
  , itm: ['./itm-server.js']
  , dfg: ['./dfg-server.js']
  , att: ['./att-server.js']
  , its: ['./its-server.js']
  , arc: ['./arc-server.js']
  , wks: ['./wks-server.js']
  }
, output: {
    path: path.resolve(__dirname, 'dist')
  , filename: '[name].node.js'
  }
, optimization: { nodeEnv: false }
, plugins: [
    new webpack.DefinePlugin({
      'process.env.PLATFORM': JSON.stringify('local')
    })
  , new ManifestPlugin({
      fileName: 'manifest.node.json'
    })
  , new Dotenv({ 
      path: './.env.webpack' 
    , safe: false
    , systemvars: false
    , silent: false
    })
  ]
, node: { __dirname: true, __filename: true }
, devtool: 'inline-source-map'
};
module.exports = merge(common, node);
