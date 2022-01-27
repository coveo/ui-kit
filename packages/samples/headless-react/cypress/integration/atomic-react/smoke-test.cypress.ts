describe('smoke test', () => {
  it('should load', () => {
    cy.visit('http://localhost:3000/atomic-react').wait(1000);
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
