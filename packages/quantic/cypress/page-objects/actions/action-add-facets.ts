export const addFacets = () =>
  cy.get('c-action-add-facets[data-id="add-facets"] button').click();
export const addFacetsWithoutInputs = () =>
  cy
    .get('c-action-add-facets[data-id="add-facets-without-inputs"] button')
    .click();
