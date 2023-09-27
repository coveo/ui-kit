/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  testEnvironment: 'jsdom',
  setupFiles: ['./jest.setup.structured.clone.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  collectCoverage: true,
  collectCoverageFrom: ['./src/**/**.ts', './src/**/**.tsx'],
  coverageThreshold: {
    global: {
      lines: 90,
    },
  },
};
