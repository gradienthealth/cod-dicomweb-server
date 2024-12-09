// Import dependencies.
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

/**
 * Configuration variables for project.
 */
export const config = {
  HOST: process.env.HOST_NAME || 'localhost', // Hostname for the server.
  IS_DEV: process.env.NODE_ENV?.includes('dev'), // If environment is development or not.
  JS_FILE_OUTPUT: '[name].min.js', // JavaScript file name once built.
  PORT: process.env.PORT_NUMBER || 9000, // Port number for the server.
};
