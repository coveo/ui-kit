import {defineConfig} from 'cypress';

export default defineConfig({
  reporter: 'spec',
  viewportHeight: 2000,
  viewportWidth: 2000,
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
    baseUrl: 'http://localhost:3666',
    specPattern: 'cypress/e2e/**/*.cypress.ts',
  },
});
