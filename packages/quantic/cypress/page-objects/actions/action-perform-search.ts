export const performSearch = () =>
  cy
    .get('c-action-perform-search button')
    .click()
    .logAction('When performing a new search');

export const setQuery = (query: string) =>
  cy
    .get('c-action-perform-search input')
    .type(query)
    .logAction(`when setting a new query: "${query}"`);

export const clearInput = () => cy.get('c-action-perform-search input').clear();
