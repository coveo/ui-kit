export const setResultsPerPage = () =>
  cy.get('c-action-results-per-page button').click();

export const setPageSizeValue = (value: number) =>
  cy.get('c-action-results-per-page input').type(value.toString());
