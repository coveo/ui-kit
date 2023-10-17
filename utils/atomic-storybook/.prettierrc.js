/** @type {import('prettier').Config} */
module.exports = {
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  bracketSpacing: false,
  singleQuote: true,
  trailingComma: 'es5',
  endOfLine: 'auto',
  overrides: [
    {files: '**/*.{scss,css,pcss,html,mdx}', options: {printWidth: 120}},
    {
      files: '**/*.js',
      options: {
        importOrderParserPlugins: ['jsx'],
      },
    },
    {
      files: '**/*.tsx',
      options: {
        importOrderParserPlugins: ['typescript', 'jsx'],
      },
    },
  ],
  importOrderParserPlugins: ['typescript'],
  importOrder: ['^[./]', '^\\/', '^\\.\\.\\/', '^\\.\\/'],
};
