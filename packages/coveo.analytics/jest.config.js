module.exports = {
  roots: ['<rootDir>/src'],
  preset: 'ts-jest',
  setupFiles: ['./tests/setup.js'],
  moduleNameMapper: {
    '@App/(.*)': '<rootDir>/src/$1',
    // TS6's __importStar creates non-configurable namespace objects,
    // preventing jest.spyOn from mocking cross-fetch's `fetch` export.
    // Redirect to a mock bridge with a mutable getter.
    '^cross-fetch$': '<rootDir>/tests/cross-fetch-mock.js',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {tsconfig: './tsconfig.test.json'}],
  },
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}'],
  testEnvironment: 'jsdom',
  coveragePathIgnorePatterns: ['.spec.*'],
  coverageReporters: ['lcov', 'cobertura', 'text-summary'],
};
