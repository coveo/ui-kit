const {resolve} = require('path');
const gtsPkgJsonPath = require.resolve('gts/package.json');
const gtsPath = resolve(gtsPkgJsonPath, '..');

module.exports = {
  root: true,
  ignorePatterns: ['storybook-static/**/*'],
  env: {
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    // due to how atomic/bueno gets copied at build time for storybook instead of installed as a dep, disable this error
    'node/no-extraneous-import': ['off'],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'no-unused-vars': [
      'error',
      {
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: [gtsPath],
      parserOptions: {
        jsxPragma: 'h',
      },
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            ignoreRestSiblings: true,
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-empty-interface': [
          'error',
          {
            allowSingleExtends: true,
          },
        ],
      },
    },
  ],
  extends: ['plugin:react/recommended'],
};
