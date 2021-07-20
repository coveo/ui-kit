import {setupAliases} from '../page-objects/full-search';

describe('example-search', () => {
  beforeEach(() => {
    cy.visit('c/exampleSearch');
    setupAliases();

    // The component take some more time to load when dev server is cold
    cy.wait('@search', {timeout: 15000});
  });

  it('should load results automatically', () => {
    cy.get('@result').should('exist');
  });

  describe('when results are loaded', () => {
    beforeEach(() => {
      cy.get('@result').should('exist');
    });

    it('should update results when clicking a facet', () => {
      cy.get('@facet-type-item-checkbox').trigger('change', {value: true});
      cy.wait('@search');
    });

    it('should show more facet values when clicking the more link', () => {
      cy.get('@facet-type-values').then((values) => {
        cy.get('@facet-type-more').trigger('click', {force: true});

        cy.wait('@search').then((interception) => {
          assert.isAtLeast(
            interception.request.body.facets[0].numberOfValues,
            values.length + 1
          );
        });
      });
    });
  });
});
