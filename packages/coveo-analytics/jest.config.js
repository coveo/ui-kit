module.exports = {
  roots: ['<rootDir>/src', '<rootDir>/functional'],
  preset: 'ts-jest',
  setupFiles: ['./tests/setup.js'],
  moduleNameMapper: {
    '@App/(.*)': '<rootDir>/src/$1',
    '^cross-fetch$': '<rootDir>/tests/crossFetch.js',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {tsconfig: './tsconfig.test.json'}],
  },
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}'],
  testEnvironment: '<rootDir>/tests/reconfigurableJSDOMEnvironment.js',
  coveragePathIgnorePatterns: ['.spec.*'],
  coverageReporters: ['lcov', 'cobertura', 'text-summary'],
};
