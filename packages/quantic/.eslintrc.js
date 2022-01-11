module.exports = {
  extends: ['../../.eslintrc.js'],
  ignorePatterns: ['typings/**/*'],
  overrides: [
    {
      files: ['lwc/**/*.js'],
      extends: ['@salesforce/eslint-config-lwc/recommended'],
      rules: {
        'consistent-returns': 'off',
      },
    },
  ],
};
