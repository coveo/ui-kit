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
    "^@salesforce/i18n/": "<rootDir>/typings/lwc/customlabels.d.ts"
  },
  modulePathIgnorePatterns: ['.cache']
  // add any custom configurations here
};
