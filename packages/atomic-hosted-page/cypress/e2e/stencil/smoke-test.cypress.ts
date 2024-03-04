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

  it('should load atomic-hosted-ui component', () => {
    cy.intercept({
      method: 'POST',
      path: '**/rest/v15/analytics/*',
    }).as('analytics');

    cy.visit('http://localhost:3335/hosted-ui.html').wait('@analytics');
    cy.get('atomic-search-box')
      .should('exist')
      .shadow()
      .find('input')
      .type('test{enter}');
  });

  it('should load atomic-hosted-ui component with a legacy page', () => {
    cy.intercept({
      method: 'POST',
      path: '**/rest/v15/analytics/*',
    }).as('analytics');

    cy.visit('http://localhost:3335/hosted-ui-legacy.html').wait('@analytics');
    cy.get('atomic-search-box')
      .should('exist')
      .shadow()
      .find('input')
      .type('test{enter}');
  });

  it('should load atomic-hosted-ui component with a custom page', () => {
    cy.intercept({
      method: 'POST',
      path: '**/rest/v15/analytics/*',
    }).as('analytics');

    cy.visit('http://localhost:3335/hosted-ui-custom.html').wait('@analytics');
    cy.get('atomic-search-box')
      .should('exist')
      .shadow()
      .find('input')
      .type('test{enter}');
  });
});
