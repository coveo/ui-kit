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
  numTestsKeptInMemory: 0,
  viewportHeight: 1080,
  viewportWidth: 1920,
  e2e: {
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome' && browser.isHeadless) {
          launchOptions.args = launchOptions.args.map((arg) => {
            if (arg === '--headless') {
              return '--headless=new';
            }

            return arg;
          });
        }

        return launchOptions;
      });
      return require('./cypress/plugins/index.ts')(on, config);
    },
    specPattern: 'cypress/e2e/**/*.cypress.ts',
    baseUrl: 'https://speed-efficiency-308-dev-ed.my.site.com/examples',
  },
});
