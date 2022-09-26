import {
  FacetManagerSelector,
  FacetManagerSelectors,
} from './facet-manager-selectors';

const facetManagerExpectations = (selector: FacetManagerSelector) => {
  return {
    containsFacets: (indexFacetIdsAlias: string) => {
      cy.get(indexFacetIdsAlias).then((facetIds) => {
        const expectedFacetIds = Cypress.$.makeArray(facetIds);

        selector
          .item()
          .then((elements) => {
            const facetElements = Cypress.$.makeArray(elements);
            const effectiveFacetIds = facetElements.map(
              (element) => element.dataset.facetId
            );

            expect(effectiveFacetIds).to.deep.equal(expectedFacetIds);
          })
          .logDetail(`should contain facets: ${expectedFacetIds.join(', ')}`);
      });
    },
  };
};

export const FacetManagerExpectations = {
  ...facetManagerExpectations(FacetManagerSelectors),
};
