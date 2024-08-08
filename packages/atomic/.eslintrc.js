module.exports = {
  globals: {
    window: 'readonly',
  },
  env: {
    browser: true,
    es2020: true,
  },
  rules: {
    curly: ['error'],
  },
  ignorePatterns: [
    'src/external-builds/**/*',
    'dist/**/*',
    'www/**/*',
    'loader/**/*',
    'docs/**/*',
    'dist-storybook',
  ],
  overrides: [
    {
      files: '**/*.config.js',
      parserOptions: {
        sourceType: 'module',
      },
    },
    {
      files: '**/*.e2e.ts',
      parserOptions: {
        project: './tsconfig.playwright.json',
        tsconfigRootDir: __dirname,
      },
      rules: {
        '@typescript-eslint/no-floating-promises': 'error',
      },
    },
  ],
};
