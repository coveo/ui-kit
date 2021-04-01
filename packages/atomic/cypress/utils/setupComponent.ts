const searchInterfaceTag = 'atomic-search-interface';
export function injectComponent(
  componentHtml: string,
  executeFirstSearch = true
) {
  cy.document().then(async (document) => {
    document.body.innerHTML = `<${searchInterfaceTag}>${componentHtml}</${searchInterfaceTag}>`;
    const searchInterface: any = document.querySelector(searchInterfaceTag);
    await searchInterface.initialize({
      accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
      organizationId: 'searchuisamples',
    });
    executeFirstSearch && searchInterface.executeFirstSearch();
  });
}

export const searchEndpoint =
  'https://platform.cloud.coveo.com/rest/search/v2?organizationId=searchuisamples';

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

export function setUpPage(htmlCode: string) {
  setupIntercept();
  cy.visit('http://localhost:3333/pages/test.html');
  cy.injectAxe();
  injectComponent(htmlCode);
  cy.wait(500); // TODO: waiting for @coveoSearch is less flaky
}

export function setUpPageNoSearch(htmlCode: string) {
  setupIntercept();
  cy.visit('http://localhost:3333/pages/test.html');
  cy.injectAxe();
  injectComponent(htmlCode, false);
  cy.wait(300);
}

export function shouldRenderErrorComponent(selector: string) {
  cy.get(selector).shadow().find('atomic-component-error').should('exist');
}
