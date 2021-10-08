import {configure} from '../../page-objects/configurator';
import {InterceptAliases, interceptSearch} from '../../page-objects/search';

describe('quantic-facet-manager', () => {
  const pageUrl = 's/quantic-facet-manager';

  function visit() {
    interceptSearch();
    cy.visit(pageUrl);
    configure({});
  }

  it('should load facets as expected', () => {
    visit();

    cy.wait(InterceptAliases.Search)
      .then((interception) => {
        const facetIds = interception.response?.body.facets.map(
          (f) => f.facetId
        );
        cy.wrap(facetIds).as('responseFacetIds');
      })
      .get('.facet-manager__host_ready')
      .get('.facet-manager__item')
      .then(function (elements) {
        const effectiveFacetIds = Cypress.$.makeArray(elements).map(
          (element) => element.dataset.facetId
        );

        expect(effectiveFacetIds).to.deep.equal(this.responseFacetIds);
      })
      .intercept('POST', '**/rest/search/v2?*', (req) => {
        req.continue((res) => {
          const indexFacets = res.body.facets;

          // Let's put the facets in the following order (with score): language, objecttype, date
          const reorderedFacets = [
            {
              ...indexFacets.find((f) => f.facetId === 'language'),
              indexScore: 0.9,
            },
            {
              ...indexFacets.find((f) => f.facetId === 'objecttype'),
              indexScore: 0.5,
            },
            {...indexFacets.find((f) => f.facetId === 'date'), indexScore: 0.3},
          ];

          res.body.facets = reorderedFacets;
          res.send();
        });
      })
      .as(InterceptAliases.Search.substring(1))
      .get('c-action-perform-search button')
      .click()
      .wait(InterceptAliases.Search)
      .get('.facet-manager__host_ready')
      .get('.facet-manager__item')
      .then((elements) => {
        const effectiveFacetIds = Cypress.$.makeArray(elements).map(
          (element) => element.dataset.facetId
        );

        expect(effectiveFacetIds).to.deep.equal([
          'language',
          'objecttype',
          'date',
        ]);
      });
  });
});
