export const setRecentResultsListLocalStorage = () =>
  cy
    .get('c-action-set-local-storage .configurator__set-local-storage')
    .click()
    .logAction('when setting the local storage');

export const clearLocalStorage = () =>
  cy
    .get('c-action-set-local-storage .configurator__clear-local-storage')
    .click()
    .logAction('when clearing the local storage');
