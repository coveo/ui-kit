import {setupAliases} from '../page-objects/example-quantic-facet';

describe('example-quantic-facet', () => {
  it('should display the right label and content', () => {
    cy.visit(
      'https://sandbox-ruby-dream-812-dev-ed-17ae32ce3cc.cs95.force.com/examples/s/quantic-facet'
    )
      .then(setupAliases)
      .get('@configurator-field')
      .invoke('val', 'language')
      .get('@configurator-label')
      .invoke('val', 'Language')
      .get('@configurator-try')
      .click()
      .get('c-quantic-facet .slds-card__header-title')
      .should('contain', 'Language')
      .get('c-quantic-facet-value')
      .should('contain', 'English');
  });
});
