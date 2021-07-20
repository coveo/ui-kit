export const setupAliases = () => {
  cy.intercept(
    'POST',
    'https://platform.cloud.coveo.com/rest/search/v2?organizationId=searchuisamples'
  ).as('search');

  cy.get('c-quantic-result').as('result');

  cy.get('c-quantic-summary > p').as('summary');

  cy.get('c-quantic-facet[data-cy="type"]').as('facet-type');

  cy.get('@facet-type').find('c-quantic-facet-value').as('facet-type-values');

  cy.get('@facet-type')
    .find('lightning-button[data-cy="more"]')
    .as('facet-type-more');

  cy.get('@facet-type')
    .find('c-quantic-facet-value[data-cy="Item"] input[type="checkbox"]')
    .as('facet-type-item-checkbox');
};
