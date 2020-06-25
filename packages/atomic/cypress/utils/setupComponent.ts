function getDocument() {
  return new Promise((resolve) => {
    cy.document().then((d) => {
      resolve(d);
    });
  });
}

async function injectComponent(componentInCode: string) {
  const document = await getDocument();
  document.body.innerHTML = componentInCode;
}

export function setUpPage(htmlCode: string, polyfill: {}) {
  cy.server();
  cy.route('POST', '**/rest/ua/v15/analytics/search*').as('coveoAnalytics');
  cy.route('POST', '**/rest/search/querySuggest').as('coveoQuerySuggest');
  cy.route('POST', '**/rest/search').as('coveoSearch');
  // Setup page with new component
  cy.visit('http://localhost:3333');
  injectComponent(htmlCode);
}
