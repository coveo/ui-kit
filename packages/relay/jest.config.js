/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  moduleNameMapper: {
    "^@coveo/explorer-messenger$": "<rootDir>/src/__mocks__/messenger",
    "^(.*)\\.js$": "$1",
  },
};
