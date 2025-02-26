const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist', 'cjs'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    clean: true
  },
  optimization: {
    minimize: false,
    minimizer: [new TerserPlugin({ extractComments: false })]
  },
  module: {
    rules: [
      {
        test: /\.(m|j|t)s$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    // alias: {
    //   url: require.resolve('url')
    // }
  },
  plugins: [
    new CleanWebpackPlugin({
      root: path.resolve(__dirname, 'dist', 'cjs')
    }),
    new webpack.DefinePlugin({
      'import.meta.url': JSON.stringify('file://' + path.resolve(__dirname, 'src', 'webWorker'))
    })
  ],
  target: 'node'
};
