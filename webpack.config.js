var path = require('path');
var webpack = require('webpack');

var development = {
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?http://0.0.0.0:3000', // WebpackDevServer host and port
    'webpack/hot/only-dev-server',
    './src/index'
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: ''
  },
  plugins: [
    new webpack.EnvironmentPlugin(['NODE_ENV', 'playlist']),
    new webpack.HotModuleReplacementPlugin(),
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ['react-hot', 'babel'],
      include: /src/
    }]
  }
}

// clone the dev configuration, split out the source map, and remove
// webpack-dev-server and hot reloading
var production = Object.assign(
  {},
  development,
  {
    devtool: 'cheap-module-source-map',
    plugins: [
      new webpack.EnvironmentPlugin(['NODE_ENV', 'playlist']),
    ],
    entry: [
      './src/index',
    ]
  }
)

module.exports = process.env.NODE_ENV == 'production' ?
  production :
  development
