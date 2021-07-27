import {setupAliases} from '../../page-objects/example-quantic-facet';

describe('example-quantic-facet', () => {
  const quanticFacetUrl =
    'https://sandbox-customization-power-8699-dev-17ae8f94da9.cs10.force.com/examples/s/quantic-facet';

  it('should display the right label and content', () => {
    cy.visit(quanticFacetUrl)
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

  it('should display more values when clicking more button and reset when clicking less button', () => {
    cy.visit(quanticFacetUrl)
      .then(setupAliases)
      .get('@configurator-try')
      .click()
      .get('c-quantic-facet-value')
      .should('have.length', 8)
      .get('lightning-button[data-cy="more"]')
      .click()
      .get('c-quantic-facet-value')
      .should('have.length.greaterThan', 8)
      .get('lightning-button[data-cy="more"]')
      .should('exist')
      .get('lightning-button[data-cy="less"]')
      .click()
      .get('c-quantic-facet-value')
      .should('have.length', 8)
      .get('lightning-button[data-cy="less"]')
      .should('not.exist');
  });
});
