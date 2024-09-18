const baseConfig = require('../../.prettierrc.js');

module.exports = {
  ...baseConfig,
  plugins: ['prettier-plugin-apex'],
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
