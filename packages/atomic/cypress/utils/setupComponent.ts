import {sampleConfig, setupIntercept} from '../fixtures/fixture-common';

export const buildTestUrl = (hash = '') => `test.html#${hash}`;

const searchInterfaceTag = 'atomic-search-interface';
export function injectComponent(
  componentHtml: string,
  executeFirstSearch = true
) {
  cy.document().then(async (document) => {
    document.body.innerHTML = `<${searchInterfaceTag}>${componentHtml}</${searchInterfaceTag}>`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchInterface: any = document.querySelector(searchInterfaceTag);
    await searchInterface.initialize(sampleConfig);
    executeFirstSearch && searchInterface.executeFirstSearch();
  });
}

export const searchEndpoint =
  'https://searchuisamples.org.coveo.com/rest/search/v2?organizationId=searchuisamples';

// TODO: rename to setupPage (typo)
// TODO: add options object for arguments (with urlHash, wait options)
export function setUpPage(htmlCode: string, executeFirstSearch = true) {
  setupIntercept();
  cy.visit(buildTestUrl());
  cy.injectAxe();
  injectComponent(htmlCode, executeFirstSearch);
  // TODO: when executeFirstSearch = true, waiting for @coveoSearch would be less flaky
  cy.wait(300);
}

export function shouldRenderErrorComponent(selector: string) {
  cy.get(selector).shadow().find('atomic-component-error').should('exist');
}
