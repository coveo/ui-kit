export function injectComponent(componentInCode: string) {
  cy.get('atomic-search-interface').should('exist');
  cy.document().then((document: any) => {
    document.querySelector(
      'atomic-search-interface'
    ).innerHTML = componentInCode;
  });
}
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
    url:
      'https://platform.cloud.coveo.com/rest/search/v2?organizationId=searchuisamples',
  }).as('coveoSearch');
}

export function setUpPage(htmlCode: string) {
  setupIntercept();
  // Setup page with new component
  cy.visit('http://localhost:3333/pages/test.html');
  cy.injectAxe();
  injectComponent(htmlCode);
  cy.wait(1000);
}

export function setUpPageNoSearch(htmlCode: string) {
  setupIntercept();
  // Setup page with new component
  cy.visit('http://localhost:3333/pages/test-no-search.html');
  cy.injectAxe();
  injectComponent(htmlCode);
  cy.wait(1000);
}

export function shouldRenderErrorComponent(selector: string) {
  cy.get(selector).shadow().find('atomic-component-error').should('exist');
}
