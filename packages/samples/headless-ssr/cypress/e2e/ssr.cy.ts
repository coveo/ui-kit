const NEXT_DEV_SERVER = 'http://localhost:3000/';
describe('headless ssr smoke tests', () => {
  it('renders page in CSR as expected', () => {
    const numResults = 10;
    cy.visit(NEXT_DEV_SERVER).contains(
      `Hydrated engine with ${numResults} results`
    );
    cy.get('li').should('have.length', numResults);
  });
});
