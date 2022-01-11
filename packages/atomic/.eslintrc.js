module.exports = {
  extends: ['../../.eslintrc.js'],
  globals: {
    window: 'readonly',
  },
  env: {
    browser: true,
  },
  ignorePatterns: [
    'src/external-builds/**/*',
    'dist/**/*',
    'www/**/*',
    'loader/**/*',
    'docs/**/*',
    'storybook-static/**/*',
    'headless/**/*',
  ],
  overrides: [{files: '**/*.config.js', parserOptions: {sourceType: 'module'}}],
};
