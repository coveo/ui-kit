const decoratorPlugin = JSON.stringify([
  'decorators',
  {decoratorsBeforeExport: true},
]);

/** @type {import('prettier').Config} */
module.exports = {
  plugins: [
    '@trivago/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
  ],
  bracketSpacing: false,
  singleQuote: true,
  trailingComma: 'es5',
  endOfLine: 'auto',
  overrides: [
    {files: '**/*.{scss,css,pcss,html,mdx}', options: {printWidth: 120}},
    {
      files: '**/*.tsx',
      options: {
        importOrderParserPlugins: ['typescript', 'jsx', decoratorPlugin],
      },
    },
  ],
  importOrderParserPlugins: ['typescript', decoratorPlugin],
  importOrder: ['^[./]', '^\\/', '^\\.\\.\\/', '^\\.\\/'],
};
