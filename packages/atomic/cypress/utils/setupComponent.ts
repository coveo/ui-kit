function getDocument() {
  return new Promise((resolve) => {
    cy.document().then((d) => {
      resolve(d);
    });
  });
}

async function injectComponent(componentInCode: string) {
  const document = await getDocument();
  document.querySelector('atomic-search-interface').innerHTML = componentInCode;
}

export function setUpPage(htmlCode: string) {
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
  // Setup page with new component
  cy.visit('http://localhost:3333/pages/test.html');
  cy.injectAxe();
  injectComponent(htmlCode);
}
