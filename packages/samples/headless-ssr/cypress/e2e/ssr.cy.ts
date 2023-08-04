import 'cypress-web-vitals';

describe('headless ssr smoke tests', () => {
  it('renders page in CSR as expected', () => {
    const numResults = 10;
    cy.visit('/').contains(`Hydrated engine with ${numResults} results`);
    cy.get('li').should('have.length', numResults);
  });

  it('should pass the web-vitals audits', () => {
    const VITALS_THRESHOLD = {}; // TODO
    cy.vitals();
  });
});
