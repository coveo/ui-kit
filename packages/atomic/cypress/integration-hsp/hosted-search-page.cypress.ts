/*
 *  This test is run under the separate configuraton "atomic/cypress-hsp.json"
 */

describe('Validate Atomic components in Hosted Search Page', () => {
  before(() => {
    cy.exec('python3 cypress/scripts/get_hosted_search_page.py');
  });

  it('Visits the test page', () => {
    cy.visit('http://localhost:3333/hosted');
  });
});
