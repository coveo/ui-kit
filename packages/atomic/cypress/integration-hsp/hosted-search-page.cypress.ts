const atomicPackage = require('../../package.json');

/*
 *  This test is run under the separate configuration "atomic/cypress-hsp.json"
 */

describe('Validate Atomic components in Hosted Search Page', () => {
  before(() => {
    cy.exec('node cypress/scripts/getHostedSearchPage.js');
  });

  it('Visits the test page', () => {
    cy.visit('http://localhost:3333/hosted');

    cy.window()
      .its('CoveoAtomic')
      .its('version')
      .should('eq', atomicPackage.version);
  });
});
