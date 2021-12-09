export const setRecentResultsListLocalStorage = () =>
  cy.get('c-action-set-local-storage .configurator__set-local-storage').click();

export const clearLocalStorage = () =>
  cy
    .get('c-action-set-local-storage .configurator__clear-local-storage')
    .click();
