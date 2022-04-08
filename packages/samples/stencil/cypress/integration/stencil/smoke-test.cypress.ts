describe('smoke test', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      path: '**/rest/ua/v15/analytics/*',
    }).as('analytics');

    cy.visit('http://localhost:3666').wait('@analytics');
  });

  it('should load', () => {
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

  it('should load custom components', () => {
    cy.get('sample-component')
      .should('exist')
      .shadow()
      .find('button')
      .first()
      .click();

    cy.get('atomic-result-list')
      .shadow()
      .find('atomic-result')
      .shadow()
      .find('sample-result-component')
      .should('exist')
      .shadow()
      .contains('Written by:');
  });

  it(
    'should load the facets inside the refine modal properly',
    {viewportWidth: 720},
    () => {
      cy.get('atomic-refine-toggle').should('exist').click();
      cy.get('atomic-refine-modal atomic-facet').should('have.length', 2);
    }
  );
});
