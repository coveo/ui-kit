const {resolve} = require('path');
const gtsPkgJsonPath = require.resolve('gts/package.json');
const gtsPath = resolve(gtsPkgJsonPath, '..');

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react'],
  extends: [gtsPath],
  ignorePatterns: ['**/*.js', 'build/**/*'],
};
