import {Interception} from 'cypress/types/net-stubbing';

export const searchEndpoint = '**/rest/search/v2?*';

export function setupIntercept() {
  cy.intercept({
    method: 'POST',
    path: '**/rest/ua/v15/analytics/*',
  }).as('coveoAnalytics');

  cy.intercept({
    method: 'POST',
    path: '**/rest/search/v2/querySuggest?*',
  }).as('coveoQuerySuggest');

  cy.intercept({
    method: 'POST',
    url: searchEndpoint,
  }).as('coveoSearch');
}

export interface PageSetupOptions {
  html: string;
  shouldExecuteSearch?: boolean;
  shouldWait?: boolean;
  urlHash?: string;
}

export function setupPage(options: PageSetupOptions) {
  const opts: PageSetupOptions = {
    urlHash: '',
    shouldExecuteSearch: true,
    shouldWait: true,
    ...options,
  };

  setupIntercept();
  cy.visit('http://localhost:3333/pages/test.html#' + opts.urlHash);
  cy.injectAxe();
  cy.injectComponent(opts.html);
  cy.initSearchInterface(opts.shouldExecuteSearch!);
  if (opts.shouldWait) {
    opts.shouldExecuteSearch && cy.wait('@coveoSearch');
    cy.wait(300); // rendering grace period
  }
}

export function shouldRenderErrorComponent(selector: string) {
  cy.get(selector).shadow().find('atomic-component-error').should('exist');
}
