const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const ManifestPlugin = require('webpack-manifest-plugin');
const common = require('./webpack.common.js');

var node = {
  target: "node",
  node: {
    __dirname: true,
    __filename: true,
  },
  entry: {
    ssr: [
      './ssr-server.js',
    ],
    api: [
      './api-server.js',
    ],
    job: [
      './job-worker.js',
    ],
    wrk: [
      './tasks/index.js',
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.PLATFORM': JSON.stringify('local')
    }),
    new ManifestPlugin({ fileName: 'manifest.node.json' }),
  ],
  output: {
    filename: '[name].node.js',
    path: path.resolve(__dirname, 'dist'),
  },
  externals: [nodeExternals()],
};
module.exports = merge(common, node);
