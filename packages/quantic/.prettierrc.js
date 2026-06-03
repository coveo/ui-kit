module.exports = {
  bracketSpacing: false,
  endOfLine: 'lf',
  printWidth: 80,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  overrides: [
    {
      files: '**/lwc/**/*.html',
      options: {parser: 'lwc'},
    },
    {
      files: '*.{cmp,page,component}',
      options: {parser: 'html'},
    },
    {
      files: '**/*.{cls,trigger}',
      options: {plugins: ['prettier-plugin-apex']},
    },
  ],
};
