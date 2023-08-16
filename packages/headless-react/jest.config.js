/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jest-environment-jsdom',
  setupFiles: ['./jest.setup.js'],
  collectCoverage: true,
  collectCoverageFrom: ['./src/**.ts', './src/**.tsx'],
  coverageThreshold: {
    global: {
      // TODO: KIT-2679 enable coverage threshold after adding more tests
      // lines: 90,
    },
  },
};
