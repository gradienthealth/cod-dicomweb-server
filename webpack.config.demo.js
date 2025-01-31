const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const getPackageJson = require('./scripts/getPackageJson');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const { version, name, license, repository, author } = getPackageJson('version', 'name', 'license', 'repository', 'author');

const banner = `
${name} v${version}
${repository.url}

  Copyright (c) ${author.replace(/ *<[^)]*> */g, ' ')} and project contributors.

  This source code is licensed under the ${license} license found in the
  LICENSE file in the root directory of this source tree.
`;

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: { main: './src/index.ts', demo: './demo/index.js' },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist', 'demo'),
    libraryTarget: 'umd',
    clean: true
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({ extractComments: false })]
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'demo')
    },
    port: 8080,
    open: true,
    hot: true
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
  plugins: [
    new CleanWebpackPlugin({
      root: path.resolve(__dirname, 'dist', 'demo')
    }),
    new webpack.BannerPlugin(banner),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './demo/index.html',
      cache: true
      //   minify: {
      //     collapseWhitespace: true,
      //     removeComments: true
      //   }
    })
  ],
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  stats: {
    children: true
  }
};
