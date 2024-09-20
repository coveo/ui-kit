import {defineConfig} from 'cypress';
import plugin from './cypress/plugins/index.js';

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
      return plugin(on, config);
    },
    baseUrl: 'http://localhost:3333',
    specPattern: 'cypress/integration-hsp/**/*.cypress.ts',
  },
});
