process.env.TZ = 'Australia/Eucla';

module.exports = {
  preset: 'ts-jest',
  silent: true,
  moduleNameMapper: {
    '@coveo/pendragon': '<rootDir>/ponyfills/magic-cookie-node.js',
  },
};
