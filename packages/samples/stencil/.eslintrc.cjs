const {resolve} = require('path');
const gtsPkgJsonPath = require.resolve('gts/package.json');
const gtsPath = resolve(gtsPkgJsonPath, '..');

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [gtsPath],
  parserOptions: {
    jsxPragma: 'h',
  },
  ignorePatterns: ['**/*.js', 'www', 'dist'],
};
