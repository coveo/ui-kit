describe('smoke test', () => {
  it('should load', () => {
    cy.intercept({
      method: 'POST',
      path: '**/rest/ua/v15/analytics/*',
    }).as('analytics');

    cy.visit('http://localhost:3335/').wait('@analytics');
    cy.get('atomic-search-box')
      .should('exist')
      .shadow()
      .find('input')
      .type('test{enter}');
  });
});
