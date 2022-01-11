const baseConfig = require('../../.prettierrc.js');

module.exports = {
  ...baseConfig,
  tabWidth: 2,
  overrides: [
    {
      files: '**/lwc/**/*.html',
      options: {parser: 'lwc'},
    },
  ],
};
