export {};
describe('smoke test', {viewportHeight: 2000, viewportWidth: 2000}, () => {
  // Context: https://stackoverflow.com/a/50387233
  // This is a benign error that can be safely ignored
  const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/;
  Cypress.on('uncaught:exception', (err) => {
    if (resizeObserverLoopErrRe.test(err.message)) {
      return false;
    }
    return true;
  });

  it('should load', () => {
    cy.intercept({
      method: 'POST',
      path: '**/rest/v15/analytics/*',
    }).as('analytics');

    cy.visit('http://localhost:3000').wait('@analytics', {timeout: 50000});
    cy.get('atomic-search-box')
      .should('exist')
      .shadow()
      .find('textarea[part="textarea"]')
      .type('test{enter}');

    cy.get('atomic-facet').should('exist');
    cy.get('atomic-query-summary')
      .should('exist')
      .shadow()
      .find('div[part="container"]')
      .contains(/Results 1-[1-9]/)
      .contains('for test');

    cy.get('atomic-result-list')
      .should('exist')
      .shadow()
      .find('atomic-result')
      .should('exist');
  });
});
