const {resolve} = require('path');

module.exports = {
  ignorePatterns: ['dist', 'temp', 'ponyfills'],
  plugins: ['canonical'],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        project: resolve(__dirname, 'tsconfig.json'),
      },
    },
  },
  rules: {
    'node/no-unpublished-import': ['error'],
    '@typescript-eslint/no-namespace': 'off',
    curly: ['error'],
    'canonical/no-barrel-import': 'error',
  },
  globals: {
    fetch: true,
  },
};
