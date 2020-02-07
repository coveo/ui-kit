module.exports = {
    roots: ['<rootDir>/src', '<rootDir>/functional'],
    preset: 'ts-jest',
    setupFiles: ['./tests/setup.js'],
    moduleNameMapper: {
        '@App/(.*)': '<rootDir>/src/$1',
    },
    globals: {
        'ts-jest': {
            tsConfig: './tsconfig.test.json',
        },
    },
    collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}'],
    coveragePathIgnorePatterns: ['.spec.*'],
    coverageReporters: ['lcov', 'cobertura', 'text-summary']
};
