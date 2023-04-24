process.env.TZ = 'Australia/Eucla';

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  silent: true,
  setupFiles: [
    '<rootDir>/src/test/jest.crypto-setup.js',
  ],
};
