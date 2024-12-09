module.exports = {
  '*.{js,jsx,cjs,json,ts,tsx}': 'eslint',
  '*.{ts,tsx}': () => 'yarn check-types',
};
