import {setupAliases} from '../../page-objects/example-quantic-facet';

describe('example-quantic-facet', () => {
  const quanticFacetUrl = `${Cypress.env('examplesUrl')}/s/quantic-facet`;

  beforeEach(() => {
    cy.visit(quanticFacetUrl).then(setupAliases);
  });

  it('should display the right label and content', () => {
    cy.get('@configurator-field')
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
    cy.get('@configurator-try')
      .click()
      .get('c-quantic-facet-value')
      .should('have.length', 8)
      .get('button[data-cy="more"]')
      .click()
      .get('c-quantic-facet-value')
      .should('have.length.greaterThan', 8)
      .get('button[data-cy="more"]')
      .should('exist')
      .get('button[data-cy="less"]')
      .click()
      .get('c-quantic-facet-value')
      .should('have.length', 8)
      .get('button[data-cy="less"]')
      .should('not.exist');
  });
});
