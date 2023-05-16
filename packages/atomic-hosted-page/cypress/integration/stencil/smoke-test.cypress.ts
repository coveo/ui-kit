describe('smoke test', () => {
  it('should load atomic-hosted-page component', () => {
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

  it('should load atomic-simple-builder component', () => {
    cy.intercept({
      method: 'POST',
      path: '**/rest/v15/analytics/*',
    }).as('analytics');

    cy.visit('http://localhost:3335/simple-builder.html').wait('@analytics');
    cy.get('atomic-search-box')
      .should('exist')
      .shadow()
      .find('input')
      .type('test{enter}');
  });
});
