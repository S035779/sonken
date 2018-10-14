const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const ManifestPlugin = require('webpack-manifest-plugin');
const common = require('./webpack.common.js');

var node = {
  target: "node"
, externals: [ nodeExternals() ]
, devtool: 'inline-source-map'
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
  }
, optimization: {
    nodeEnv: false
  }
, plugins: [
    new webpack.DefinePlugin({ 
      'process.env.PLATFORM': JSON.stringify('local') 
    })
  , new ManifestPlugin({ 
      fileName: 'manifest.node.json' 
    }),
  ],
  output: {
    filename: '[name].node.js'
  , path: path.resolve(__dirname, 'dist')
  }
, node: {
    __dirname: true
  , __filename: true
  }
, mode: 'none'
};
module.exports = merge(common, node);
