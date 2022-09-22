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
  eyesIsDisabled: false,
  eyesBrowser:
    '[{"width":800,"height":600,"name":"chrome"},{"width":700,"height":500,"name":"firefox"},{"width":1024,"height":768,"name":"edgechromium"},{"width":800,"height":600,"name":"safari"},{"deviceName":"iPhone X","screenOrientation":"portrait"},{"deviceName":"Pixel 2","screenOrientation":"portrait"}]',
  eyesFailCypressOnDiff: false,
  eyesDisableBrowserFetching: false,
  eyesTestConcurrency: 5,
  appliConfFile: {
    batchName: 'Atomic visual tests',
    showLogs: false,
    failCypressOnDiff: false,
    apiKey: 'undefined',
    isDisabled: false,
    browser: [
      {
        width: 800,
        height: 600,
        name: 'chrome',
      },
      {
        width: 700,
        height: 500,
        name: 'firefox',
      },
      {
        width: 1024,
        height: 768,
        name: 'edgechromium',
      },
      {
        width: 800,
        height: 600,
        name: 'safari',
      },
      {
        deviceName: 'iPhone X',
        screenOrientation: 'portrait',
      },
      {
        deviceName: 'Pixel 2',
        screenOrientation: 'portrait',
      },
    ],
    visualGridOptions: {
      polyfillAdoptedStyleSheets: true,
    },
    batch: {
      id: 'ce5daecc-f392-4f9a-80a3-028b9bb1f9a0',
    },
  },
  eyesIsGlobalHooksSupported: false,
  eyesPort: 53004,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config);
    },
    baseUrl: 'http://localhost:3333',
    specPattern: 'cypress/integration-screenshots/**/*.cypress.ts',
  },
});
