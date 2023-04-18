module.exports = {
    roots: ['<rootDir>/src', '<rootDir>/functional'],
    preset: 'ts-jest',
    setupFiles: ['./tests/setup.js'],
    moduleNameMapper: {
        '@App/(.*)': '<rootDir>/src/$1',
    },
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {tsconfig: './tsconfig.test.json'}],
    },
    collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}'],
    testEnvironment: 'jsdom',
    coveragePathIgnorePatterns: ['.spec.*'],
    coverageReporters: ['lcov', 'cobertura', 'text-summary'],
};
