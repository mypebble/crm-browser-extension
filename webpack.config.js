var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: './src/gmail.js',
  output: {
    path: path.resolve(__dirname, './build/js'),
    publicPath: '/build/js/',
    filename: 'gmail.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      },
      {
        test: /\.jst$/,
        loader: 'underscore-template-loader'
      },
      {
        test: /\.scss$/,
        use: [{
            loader: "style-loader"
        }, {
            loader: "css-loader", options: {
                sourceMap: true
            }
        }, {
            loader: "sass-loader", options: {
                sourceMap: true
            }
        }]
        }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      _: 'underscore'
    })
  ],
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  resolve: {
    modules: [path.resolve(__dirname, "src"), "node_modules"],
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map'
}

