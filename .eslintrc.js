const {resolve} = require('path');
const gtsPkgJsonPath = require.resolve('gts/package.json');
const gtsPath = resolve(gtsPkgJsonPath, '..');

module.exports = {
  ignorePatterns: [
    'node_modules',
    'stencil-generated',
    'dist',
    'www',
    '!.storybook',
    'scripts/deploy/execute-deployment-pipeline.mjs',
    'build',
  ],
  env: {
    jest: true,
    es6: true,
  },
  extends: ['plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['**/package-lock.json'],
      parser: 'eslint-plugin-json-es',
      plugins: ['package-lock'],
      rules: {
        'package-lock/lock-file-version': [
          'error',
          {
            version: 3,
          },
        ],
      },
    },
    {
      // Note: *.md files are directly checked using cspell cli in lint-staged
      files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs'],
      extends: ['plugin:@cspell/recommended'],
      rules: {
        '@cspell/spellchecker': ['error'],
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
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
    {
      files: ['**/*.js', '**/*.jsx'],
      extends: ['eslint:recommended'],
      rules: {
        'no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
          },
        ],
      },
      env: {
        node: true,
      },
    },
    {
      files: '**/*.mjs',
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2022,
      },
    },
  ],
  root: true,
};
