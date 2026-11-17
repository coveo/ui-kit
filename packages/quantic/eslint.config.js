const lwcRecommended = require('@salesforce/eslint-config-lwc/recommended');
const typescriptParser = require('@typescript-eslint/parser');
const prettier = require('eslint-config-prettier');

const mainDefault = 'force-app/main/default';
const playground = 'force-app/playgroundComponents/main/lwc';
const solutionExamples = 'force-app/solutionExamples/main/lwc';

const e2eTypeScriptOverride = (baseDir) => ({
  files: [`${baseDir}/**/e2e/*.ts`],
  languageOptions: {
    parser: typescriptParser,
  },
  rules: {
    'no-redeclare': ['error', {builtinGlobals: false}],
  },
});

module.exports = [
  {
    ignores: [
      'typings/**',
      'force-app/test/jest-mocks/**',
      `${mainDefault}/staticresources/**`,
      `${solutionExamples}/staticresources/**`,
    ],
  },
  ...lwcRecommended,
  // Keep the ESLint 8 behavior where ESLint 9 changed defaults.
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
    rules: {
      'no-unused-vars': [
        'error',
        {vars: 'all', args: 'after-used', caughtErrors: 'none'},
      ],
    },
  },
  {
    files: ['**/__tests__/**'],
    languageOptions: {
      globals: {
        require: 'readonly',
      },
    },
  },
  {
    files: [`${mainDefault}/**`],
    languageOptions: {
      globals: {
        CoveoHeadless: 'readonly',
        CoveoHeadlessCaseAssist: 'readonly',
        CoveoHeadlessInsight: 'readonly',
        CoveoHeadlessRecommendation: 'readonly',
        Bueno: 'readonly',
        DOMPurify: 'readonly',
        marked: 'readonly',
      },
    },
    rules: {
      'no-unused-expressions': ['error', {allowTernary: true}],
    },
  },
  {
    files: [`${playground}/**`],
    languageOptions: {
      globals: {
        CoveoHeadless: 'readonly',
        CoveoHeadlessCaseAssist: 'readonly',
        CoveoHeadlessInsight: 'readonly',
      },
    },
  },
  {
    files: [`${solutionExamples}/**`],
    languageOptions: {
      globals: {
        CoveoHeadless: 'readonly',
        CoveoHeadlessCaseAssist: 'readonly',
        coveoua: 'readonly',
      },
    },
  },
  {
    ...prettier,
    files: [`${mainDefault}/**`, `${solutionExamples}/**`],
  },
  {
    files: [`${mainDefault}/**/__tests__/**`],
    rules: {
      '@lwc/lwc/no-async-operation': 'off',
    },
  },
  e2eTypeScriptOverride(mainDefault),
  e2eTypeScriptOverride(solutionExamples),
];
