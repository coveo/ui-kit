const cypressSplit = require('cypress-split');

/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  cypressSplit(on, config);
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('before:browser:launch', (browser = {}, launchOptions) => {
    if (browser.family === 'chromium' && browser.name !== 'electron') {
      if (browser.isHeadless) {
        // Workaround to use new headless mode until Cypress can be upgraded to >= 12.15 (KIT-2576)
        // https://developer.chrome.com/articles/new-headless/
        const version = parseInt(browser.majorVersion);
        if (version >= 112) {
          launchOptions.args.push('--headless=new');
        }
      } else {
        // auto open devtools in headed (local dev) mode to increase visibility of errors in console
        launchOptions.args.push('--auto-open-devtools-for-tabs');
      }
    } else if (browser.family === 'firefox') {
      launchOptions.args.push('-devtools');
    } else if (browser.name === 'electron') {
      launchOptions.preferences.devTools = true;
    }

    return launchOptions;
  });
  return config;
};
