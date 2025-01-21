module.exports = {
  presets: [['@babel/preset-env'], ['@babel/preset-typescript']],
  plugins: [
    ['@babel/plugin-proposal-class-properties'],
    ['@babel/plugin-transform-typescript'],
    ...(process.env.NODE_ENV === 'test' ? ['babel-plugin-transform-import-meta'] : [])
  ]
};
