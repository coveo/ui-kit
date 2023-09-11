/** @type {import('prettier').Config} */
module.exports = {
  bracketSpacing: false,
  singleQuote: true,
  trailingComma: 'es5',
  endOfLine: 'auto',
  overrides: [
    {files: '**/*.{scss,css,pcss,html,mdx}', options: {printWidth: 120}},
    {
      files: '**/*.{js,tsx}',
      options: {
        importOrderParserPlugins: ['jsx'],
      },
    },
  ],
  importOrderParserPlugins: ['typescript'],
  importOrder: ['^[./]', '^\\/', '^\\.\\.\\/', '^\\.\\/'],
};
