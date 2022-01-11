module.exports = {
  printWidth: 120,
  bracketSpacing: false,
  singleQuote: true,
  trailingComma: 'es5',
  endOfLine: 'auto',
  overrides: [
    {
      files: '*.{js,ts?(x)}',
      options: {
        printWidth: 80,
      },
    },
  ],
};
