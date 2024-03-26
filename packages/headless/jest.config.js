process.env.TZ = 'Australia/Eucla';

module.exports = {
  preset: 'ts-jest',
  silent: true,
  setupFiles: ['./jest.setup.js'],
  moduleNameMapper: {
    '@coveo/please-give-me-fetch':
      '<rootDir>/ponyfills/fetch-ponyfill-browser.js',
    '@coveo/pendragon': '<rootDir>/ponyfills/magic-cookie-node.js',
    'rehype-*': '<rootDir>/ponyfills/unified-plugin.js',
    'remark-*': '<rootDir>/ponyfills/unified-plugin.js',
    unified: '<rootDir>/ponyfills/unified.js',
  },
};
