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
    '^lightning/navigation$':
      '<rootDir>/force-app/test/jest-mocks/lightning/navigation/navigation',
  },
  modulePathIgnorePatterns: ['.cache'],
  // add any custom configurations here
};
