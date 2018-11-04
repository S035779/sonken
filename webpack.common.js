const path = require('path');

const common = {
  context: path.resolve(__dirname, 'src')
, module: { rules: [
    {
      enforce: 'pre'
    , test: /\.js$/
    , exclude: /node_modules/
    , loader: 'eslint-loader'
    }
  , {
      test: /\.js$/
    , exclude: /(node_modules|bower_components)/, use: {
        loader: 'babel-loader', options: {
          babelrc: false
        , presets: [
            '@babel/preset-react', [ '@babel/preset-env', { 'modules': false
          , 'targets': { 'ie': '11', 'chrome': '68', 'firefox': '61', 'edge': '42', 'node': '10' }
          , 'useBuiltIns': 'usage'
          }]]
        , plugins: [
            'react-hot-loader/babel'
          , '@babel/proposal-object-rest-spread'
          , '@babel/transform-member-expression-literals'
          , '@babel/transform-property-literals' ]
        , compact: true
        }
      }
    }
  , {
      test: /\.css$/
    , use: [ 'style-loader', 'css-loader/locals' ] 
    }
  , {
      test: /\.(gif|jpg|png|ico)$/
    , use: [ 'file-loader?name=[name].[ext]' ]
    }
  , {
      test: /\.(eot|svg|ttf|woff|woff2)$/,
      loader: 'url-loader',
      options: {
        limit: 10000
      }
    }
  ]}
, resolve: { alias: {
    Main:       path.resolve(__dirname, 'src'           )
  , Assets:     path.resolve(__dirname, 'src/assets'    )
  , Utilities:  path.resolve(__dirname, 'src/utils'     )
  , Stores:     path.resolve(__dirname, 'src/stores'    )
  , Actions:    path.resolve(__dirname, 'src/actions'   )
  , Components: path.resolve(__dirname, 'src/components')
  , Services:   path.resolve(__dirname, 'src/services'  )
  , Pages:      path.resolve(__dirname, 'src/pages'     )
  , Routes:     path.resolve(__dirname, 'src/routes'    )
  , Models:     path.resolve(__dirname, 'src/models'    )
  , Tasks:      path.resolve(__dirname, 'src/tasks'     )
  }}
, stats: 'normal'
};

module.exports = common;
