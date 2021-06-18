export const buildTestUrl = (hash = '') => `test.html#${hash}`;

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

export const RouteAlias = {
  analytics: '@coveoAnalytics',
  querySuggest: '@coveoQuerySuggest',
  search: '@coveoSearch',
  facetSearch: '@coveoFacetSearch',
};

export function setupIntercept() {
  cy.intercept({
    method: 'POST',
    path: '**/rest/ua/v15/analytics/*',
  }).as(RouteAlias.analytics.substring(1));

  cy.intercept({
    method: 'POST',
    path: '**/rest/search/v2/querySuggest?*',
  }).as(RouteAlias.querySuggest.substring(1));

  cy.intercept({
    method: 'POST',
    path: '**/rest/search/v2/facet?*',
  }).as(RouteAlias.facetSearch.substring(1));

  cy.intercept({
    method: 'POST',
    url: searchEndpoint,
  }).as(RouteAlias.search.substring(1));
}

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
