describe('smoke test', {viewportHeight: 2000, viewportWidth: 2000}, () => {
  it('should load', () => {
    cy.intercept({
      method: 'POST',
      path: '**/rest/ua/v15/analytics/*',
    }).as('analytics');

    cy.visit('http://localhost:3666').wait('@analytics');
    cy.get('atomic-search-box')
      .should('exist')
      .shadow()
      .find('input')
      .type('test{enter}');

    cy.get('atomic-facet').should('exist');
    cy.get('atomic-query-summary')
      .should('exist')
      .shadow()
      .find('div[part="container"]')
      .contains('Results 1-10')
      .contains('for test');

    cy.get('atomic-result-list')
      .should('exist')
      .shadow()
      .find('atomic-result')
      .should('exist');
  });
});
