const {jestConfig} = require('@salesforce/sfdx-lwc-jest/config');
module.exports = {
  ...jestConfig,
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'reports',
        outputName: 'junit.xml',
      },
    ],
  ],
  moduleNameMapper: {
    '^@salesforce/i18n/': '<rootDir>/typings/lwc/customlabels.d.ts',
    '^lightning/modal$':
      '<rootDir>/force-app/test/jest-mocks/lightning/modal/modal',
    '^lightning/modalBody$':
      '<rootDir>/force-app/test/jest-mocks/lightning/modalBody/modalBody',
    '^lightning/modalFooter$':
      '<rootDir>/force-app/test/jest-mocks/lightning/modalFooter/modalFooter',
    '^lightning/modalHeader$':
      '<rootDir>/force-app/test/jest-mocks/lightning/modalHeader/modalHeader',
    '^c/quanticResult$':
      '<rootDir>/force-app/test/jest-mocks/quantic/quanticResult/quanticResult',
    '^lightning/navigation$':
      '<rootDir>/force-app/test/jest-mocks/lightning/navigation/navigation',
    '^c/quanticResultActionStyles$':
      '<rootDir>/force-app/main/default/lwc/quanticResultActionStyles/quanticResultActionStyles',
    '^c/searchBoxStyle$':
      '<rootDir>/force-app/main/default/lwc/searchBoxStyle/searchBoxStyle',
    '^c/quanticFacetStyles$':
      '<rootDir>/force-app/main/default/lwc/quanticFacetStyles/quanticFacetStyles',
    '^c/(.*)$': [
      '<rootDir>/force-app/main/default/lwc/$1/$1',
      '<rootDir>/force-app/solutionExamples/main/lwc/$1/$1',
    ],
    '^marked$': require.resolve('marked'),
  },
  modulePathIgnorePatterns: ['.cache'],
  // add any custom configurations here
};
