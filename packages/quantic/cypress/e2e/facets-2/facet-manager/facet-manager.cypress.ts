import {Interception} from 'cypress/types/net-stubbing';
import {performSearch} from '../../../page-objects/actions/action-perform-search';
import {configure} from '../../../page-objects/configurator';
import {
  getQueryAlias,
  getRoute,
  interceptSearch,
} from '../../../page-objects/search';
import {
  useCaseParamTest,
  useCaseEnum,
  InsightInterfaceExpectations as InsightInterfaceExpect,
} from '../../../page-objects/use-case';
import {scope} from '../../../reporters/detailed-collector';
import {FacetManagerExpectations as Expect} from './facet-manager-expectations';

describe('quantic-facet-manager', () => {
  const pageUrl = 's/quantic-facet-manager';
  const responseFacetIdsAlias = '@responseFacetIds';

  interface FacetManagerOptions {
    useCase: string;
  }

  function visit(options: Partial<FacetManagerOptions> = {}) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
    if (options.useCase === useCaseEnum.insight) {
      InsightInterfaceExpect.isInitialized();
      performSearch();
    }
  }

  function mockFacetOrder(facetIds: string[], useCase: string) {
    cy.intercept('POST', getRoute(useCase), (req) => {
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
    }).as(getQueryAlias(useCase).substring(1));
  }

  function getFacetOrder(interception: Interception) {
    const ids = interception.response?.body.facets
      .map((f) => f.facetId)
      .filter((id: string) => !/_input$/.test(id));
    cy.wrap(ids).as(responseFacetIdsAlias.substring(1));
  }

  useCaseParamTest.forEach((param) => {
    describe(param.label, () => {
      it('should load facets in the same order as in the search response', () => {
        visit({useCase: param.useCase});
        cy.wait(getQueryAlias(param.useCase)).then((interception) =>
          getFacetOrder(interception)
        );
        Expect.containsFacets(responseFacetIdsAlias);

        scope('when reordering the facets', () => {
          mockFacetOrder(['language', 'objecttype', 'date'], param.useCase);
          performSearch()
            .wait(getQueryAlias(param.useCase))
            .then((interception) => getFacetOrder(interception));
          Expect.containsFacets(responseFacetIdsAlias);
        });
      });
    });
  });
});
