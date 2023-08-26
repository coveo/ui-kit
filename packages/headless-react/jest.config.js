/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFiles: ['./jest.setup.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['./src/**.ts', './src/**.tsx'],
  coverageThreshold: {
    global: {
      lines: 90,
    },
  },
};
