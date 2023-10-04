/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  testEnvironment: 'jsdom',
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
  collectCoverageFrom: ['./src/**.ts', './src/**.tsx'],
  setupFiles: ['./jest.setup.js'],
  coverageThreshold: {
    global: {
      lines: 90,
    },
  },
};
