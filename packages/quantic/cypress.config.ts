import {defineConfig} from 'cypress';

export default defineConfig({
  includeShadowDom: true,
  projectId: '59g399',
  video: false,
  defaultCommandTimeout: 10000,
  retries: {
    runMode: 3,
    openMode: 1,
  },
  viewportHeight: 1080,
  viewportWidth: 1920,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.ts')(on, config);
    },
    specPattern: 'cypress/e2e/**/*.cypress.ts',
    baseUrl: 'https://speed-efficiency-308-dev-ed.my.site.com/examples',
  },
});
