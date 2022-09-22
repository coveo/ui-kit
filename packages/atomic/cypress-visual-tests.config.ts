import {defineConfig} from 'cypress';

export default defineConfig({
  projectId: '5ph2j4',
  experimentalFetchPolyfill: true,
  reporter: 'spec',
  viewportHeight: 1080,
  viewportWidth: 1920,
  retries: {
    runMode: 3,
    openMode: 1,
  },
  reporterOptions: {
    toConsole: true,
  },
  chromeWebSecurity: false,
  video: false,
  requestTimeout: 10000,
  watchForFileChanges: true,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config);
    },
    baseUrl: 'http://localhost:3333',
    specPattern: 'cypress/integration-visual-tests/**/*.cypress.ts',
  },
});

require('@applitools/eyes-cypress')(module);
