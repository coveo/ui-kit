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
  // add any custom configurations here
  modulePathIgnorePatterns: ['cypress'],
};
