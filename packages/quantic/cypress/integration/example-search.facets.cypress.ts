import {setupAliases} from '../page-objects/example-search';

describe('example-search-facets', () => {
  describe('more link', () => {
    it('should show more facet values when clicking the more link', () => {
      cy.visit('c/exampleSearch')
        .then(setupAliases)
        .wait('@search')
        .get('@facet-type-values')
        .then((values) => {
          cy.get('@facet-type-more')
            .lwcClick()
            .wait('@search')
            .then((interception) => {
              assert.isAtLeast(
                interception.request.body.facets.find(
                  (facet) => facet.field === 'objecttype'
                ).numberOfValues,
                values.length + 1
              );

              cy.get('@facet-type-values').should(
                'have.length',
                interception.response?.body.facets.find(
                  (facet) => facet.field === 'objecttype'
                ).values.length
              );
            });
        });
    });
  });

  describe('less link', () => {
    it('should show less facet values when clicking the less link', () => {
      cy.visit('c/exampleSearch')
        .then(setupAliases)
        .wait('@search')
        .get('@facet-type-more')
        .lwcClick()
        .wait('@search')
        .get('@facet-type')
        .find('lightning-button[data-cy="less"]')
        .as('facet-type-less')
        .lwcClick()
        .wait('@search')
        .then((interception) => {
          assert.equal(
            interception.request.body.facets.find(
              (facet) => facet.field === 'objecttype'
            ).numberOfValues,
            8
          );
        })
        .get('@facet-type-values')
        .should('have.length', 8)
        .get('@facet-type-less')
        .should('not.exist');
    });
  });
});
