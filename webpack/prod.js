// Import dependencies.
import { merge } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';

// Import Configuration.
import { cleanWebpackPlugin } from './plugins/index.js';
import { WebpackCommonConfig } from './common.js';

/**
 * Plugins for production build.
 */
const plugins = [cleanWebpackPlugin];

/**
 * Webpack production configuration.
 */
const WebpackConfig = {
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  plugins,
};

// Export configuration.
export const WebpackProdConfig = merge(WebpackCommonConfig, WebpackConfig);
