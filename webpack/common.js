// Import Configuration.
import {
  htmlWebpackPlugin,
  eSLintWebpackPlugin,
  dotenvWebpackPlugin,
} from './plugins/index.js';
import { paths, config } from '../configuration/index.js';
import { fonts, javaScript, typeScript } from './modules/index.js';

/**
 * Entry point for the bundle.
 */
const entry = [`${paths.src}/index.ts`];

/**
 * Set output file name and path.
 */
const output = {
  filename: config.JS_FILE_OUTPUT,
  path: paths.dist,
  publicPath: '/',
};

/**
 * Shared plugins.
 */
const plugins = [
  htmlWebpackPlugin,
  eSLintWebpackPlugin,
  dotenvWebpackPlugin,
];

/**
 * Shared modules.
 */
const modules = {
  rules: [fonts, javaScript, typeScript],
};

/**
 * Resolve extensions.
 * Alias for @ set to paths.src directory.
 */
const resolve = {
  alias: {
    '@': paths.src,
  },
  extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
};

/**
 * Webpack common configuration.
 */
export const WebpackCommonConfig = {
  context: paths.root,
  entry,
  mode: config.IS_DEV ? 'development' : 'production',
  module: modules,
  output,
  plugins,
  resolve,
  target: config.IS_DEV ? 'web' : 'browserslist',
};
