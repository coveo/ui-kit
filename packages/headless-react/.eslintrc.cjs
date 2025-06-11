const {resolve} = require('path');
const gtsPkgJsonPath = require.resolve('gts/package.json');
const gtsPath = resolve(gtsPkgJsonPath, '..');

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'testing-library'],
  extends: [gtsPath, 'plugin:testing-library/react'],
  rules: {
    'react/jsx-uses-vars': 'error',
    'react/jsx-uses-react': 'error',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'testing-library/no-manual-cleanup': 'off',
  },
  ignorePatterns: ['dist/', '**/*.js'],
};
