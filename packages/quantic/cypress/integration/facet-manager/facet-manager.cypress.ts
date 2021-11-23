// eslint-disable-next-line node/no-unpublished-import
import {Interception} from 'cypress/types/net-stubbing';
import {performSearch} from '../../page-objects/actions/action-perform-search';
import {configure} from '../../page-objects/configurator';
import {InterceptAliases, interceptSearch} from '../../page-objects/search';
import {scope} from '../../reporters/detailed-collector';
import {FacetManagerExpectations as Expect} from './facet-manager-expectations';

describe('quantic-facet-manager', () => {
  const pageUrl = 's/quantic-facet-manager';
  const responseFacetIdsAlias = '@responseFacetIds';

  function visit() {
    interceptSearch();
    cy.visit(pageUrl);
    return configure({});
  }

  function mockFacetOrder(facetIds: string[]) {
    cy.intercept('POST', '**/rest/search/v2?*', (req) => {
      req.continue((res) => {
        const facets = res.body.facets;
        const reordered: unknown[] = [];

        facetIds.forEach((facetId, idx) => {
          const facet = facets.find((f) => f.facetId === facetId);
          if (facet) {
            reordered.push({
              ...facet,
              indexScore: 1 - idx * 0.01,
            });
          }
        });

        res.body.facets = reordered;
        res.send();
      });
    }).as(InterceptAliases.Search.substring(1));
  }

  function getFacetOrder(interception: Interception) {
    const ids = interception.response?.body.facets
      .map((f) => f.facetId)
      .filter((id: string) => !/_input$/.test(id));
    cy.wrap(ids).as(responseFacetIdsAlias.substring(1));
  }

  it('should load facets in the same order as in the search response', () => {
    visit()
      .wait(InterceptAliases.Search)
      .then((interception) => getFacetOrder(interception));
    Expect.containsFacets(responseFacetIdsAlias);

    scope('when reordering the facets', () => {
      mockFacetOrder(['language', 'objecttype', 'date']);
      performSearch()
        .wait(InterceptAliases.Search)
        .then((interception) => getFacetOrder(interception));
      Expect.containsFacets(responseFacetIdsAlias);
    });
  });
});
