var path = require('path');

module.exports = {
  entry: "./src/entry.js",
  output: {
    path: __dirname,
    filename: "./dist/bundle.js"
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },
  resolve: {
    root: [
      path.resolve(__dirname, '../../'),
    ]
  },
  resolveLoader: {
    root: [
      path.resolve(__dirname, './node_modules')
    ]
  }
};