const baseConfig = require('../../.prettierrc.js');

module.exports = {
  ...baseConfig,
  ...{
    overrides: [
      {
        files: '**/lwc/**/*.html',
        options: {parser: 'lwc'},
      },
      {
        files: '*.{cmp,page,component}',
        options: {parser: 'html'},
      },
    ],
  },
};
