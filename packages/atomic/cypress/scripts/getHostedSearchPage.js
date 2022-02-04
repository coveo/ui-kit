/**
 * Adds a sample hosted search page to the public folder for Cypress tests.
 * Used for validating that the lastest Atomic build works with the hosted
 * search pages.
 */

const fs = require('fs');
const https = require('https');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const path = require('path');

const SEARCH_URL = 'https://search.cloud.coveo.com';
const ORG_ID = 'coveointernaltesting1';
const PAGE_ID = '24b0c504-00d5-4afd-90cb-1b3e7e44040f';
const PUBLIC_FOLDER = 'www/';
const BASE_URL = `${SEARCH_URL}/rest/organizations/${ORG_ID}/searchinterfaces/${PAGE_ID}/`;

/**
 * Modifies the page to use the local version of Atomic
 */
function replaceAtomicVersion(document) {
  const cssLink = document.querySelector('link[href$="themes/coveo.css"]');
  const jsScript = document.querySelector('script[src$="atomic.esm.js"]');
  cssLink.setAttribute('href', '/themes/coveo.css');
  jsScript.setAttribute('src', '/build/atomic.esm.js');
}

/**
 * Replaces the page init script to skip authentication
 */
function replaceInitScript(document) {
  const initScript = document.querySelector('#bootstrap');
  initScript.textContent = `
    (async () => {
      await customElements.whenDefined('atomic-search-interface')
      searchInterface = document.querySelector('atomic-search-interface')
      await searchInterface.initialize({
        accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
        organizationId: 'searchuisamples'
      });
      searchInterface.executeFirstSearch()
    })()
  `;
}

/**
 * Copies the css and js dependencies to the public folder
 */
function addCssAndJs() {
  const links = [
    'lib/styleguide/css/CoveoStyleGuide.css',
    'css/main.css',
    'js/SearchInterfaces.Dependencies.min.js',
    'js/SearchInterfaces.bundle.min.js',
  ];

  links.forEach((link) => {
    const filepath = PUBLIC_FOLDER + link;
    try {
      fs.mkdirSync(path.dirname(filepath), {recursive: true});
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
    const file = fs.createWriteStream(filepath);
    https.get(BASE_URL + link, (response) => {
      const code = response.statusCode;
      if (code != 200) {
        console.error(`Could not download file: ${link}, Http error: ${code}`);
        process.exit(1);
      }
      response.pipe(file);
    });
  });
}

JSDOM.fromURL(BASE_URL + 'html').then((dom) => {
  let {document} = dom.window;
  replaceAtomicVersion(document);
  replaceInitScript(document);
  addCssAndJs();
  try {
    const html = dom.serialize();
    fs.writeFileSync(PUBLIC_FOLDER + 'hosted.html', html);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
