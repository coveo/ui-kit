import {defineConfig} from 'cypress';

const tempExcludeSpecPattern = [
  '**/breadcrumb-manager.cypress.ts',
  '**/tab-bar.cypress.ts',
  '**/tab.cypress.ts',
  '**/smart-snippet.cypress.ts',
  '**/smart-snippet-suggestions.cypress.ts',
  '**/sort.cypress.ts',
  '**/facet-manager.cypress.ts',
  '**/results-per-page.cypress.ts',
  '**/generated-answer.cypress.ts',
  '**/case-classification.cypress.ts',
  '**/placeholder.cypress.ts',
  '**/result-quickview.cypress.ts',
  '**/copy-to-clipboard.cypress.ts',
  '**/summary.cypress.ts',
  '**/did-you-mean.cypress.ts',
  '**/pager.cypress.ts',
];

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
    excludeSpecPattern: tempExcludeSpecPattern,
  },
});
