const {Console} = require('console');
const cypressSplit = require('cypress-split');
const {createWriteStream} = require('fs');
const {resolve} = require('path');

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

const accessibilityLogPath = resolve(
  __dirname,
  '..',
  'screenshots',
  'accessibilityLog.log'
);

/**
 * @type {require('fs').WriteStream}
 */
let accessibilityLogStream;
/**
 * @type {Console}
 */
let accessibilityConsole;

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  cypressSplit(on, config);
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('before:browser:launch', (browser = {}, launchOptions) => {
    if (browser.family === 'chromium' && browser.name !== 'electron') {
      if (!browser.isHeadless) {
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
  on('before:run', () => {
    // Open a write stream to a file for saving accessibility errors
    // This is done in the before:run event because this is the first event to fire
    // that has access to the config object
    accessibilityLogStream = createWriteStream(accessibilityLogPath);
    accessibilityConsole = new Console(
      accessibilityLogStream,
      accessibilityLogStream
    );
  });
  on('after:run', () => {
    // Close the write stream for saving accessibility errors
    // This is done in the after:run event because this is the last event to fire
    // that has access to the config object
    accessibilityLogStream.close();
  });

  // https://github.com/component-driven/cypress-axe#in-cypress-plugins-file
  on('task', {
    log(message) {
      accessibilityConsole.log(message);

      return null;
    },
    table(message) {
      accessibilityConsole.table(message);

      return null;
    },
  });
  return config;
};
