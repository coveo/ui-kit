const {resolve} = require('path');
const gtsPkgJsonPath = require.resolve('gts/package.json');
const gtsPath = resolve(gtsPkgJsonPath, '..');

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'testing-library', 'jest-dom'],
  extends: [
    gtsPath,
    'plugin:testing-library/react',
    'plugin:jest-dom/recommended',
  ],
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
  },
  ignorePatterns: ['dist/', '**/*.js'],
};
