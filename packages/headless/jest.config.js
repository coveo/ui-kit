process.env.TZ = 'Australia/Eucla';

module.exports = {
  preset: 'ts-jest',
  silent: true,
  setupFiles: ['./jest.setup.js'],
  moduleNameMapper: {
    '@coveo/pendragon': '<rootDir>/ponyfills/magic-cookie-node.js',
  },
};
