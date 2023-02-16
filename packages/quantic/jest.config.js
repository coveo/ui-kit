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
    '^lightning/modal$': '<rootDir>/force-app/test/jest-mocks/lightning/modal',
    '^lightning/modalBody$': '<rootDir>/force-app/test/jest-mocks/lightning/modalBody',
    '^lightning/modalFooter$': '<rootDir>/force-app/test/jest-mocks/lightning/modalFooter',
    '^lightning/modalHeader$': '<rootDir>/force-app/test/jest-mocks/lightning/modalHeader',
  },
  modulePathIgnorePatterns: ['.cache'],
  // add any custom configurations here
};
