export const performSearch = () =>
  cy.get('c-action-perform-search button').click({force: true});

export const setQuery = (query: string) =>
  cy.get('c-action-perform-search input').type(query);

export const clearInput = () => cy.get('c-action-perform-search input').clear();
