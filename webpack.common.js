const path = require('path');

var common = {
  context: path.resolve(__dirname, 'src'),
  module: {
    rules: [{
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
      },{ 
        test: /\.js$/,
        loader: [ 'babel-loader' ]
      },{
        test: /\.(gif|jpg|png|svg|ico)$/,
        use: [ 'file-loader?name=[name].[ext]' ]
      }]
  },
  resolve: {
    alias: {
      Main: path.resolve(__dirname, 'src/'),
      Assets: path.resolve(__dirname, 'src/assets/'),
      Utilities: path.resolve(__dirname, 'src/utils/'),
      Stores: path.resolve(__dirname, 'src/stores'),
      Actions: path.resolve(__dirname, 'src/actions'),
      Components: path.resolve(__dirname, 'src/components'),
      Services: path.resolve(__dirname, 'src/services'),
      Pages: path.resolve(__dirname, 'src/pages'),
    }
  },
};

module.exports = common;
