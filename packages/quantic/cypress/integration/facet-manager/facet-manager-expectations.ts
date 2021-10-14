import {
  FacetManagerSelector,
  FacetManagerSelectors,
} from './facet-manager-selectors';

const facetManagerExpectations = (selector: FacetManagerSelector) => {
  return {
    containsFacets: (indexFacetIdsAlias: string) => {
      selector.item().then((elements) => {
        const effectiveFacetIds = Cypress.$.makeArray(elements).map(
          (element) => element.dataset.facetId
        );

        cy.get(indexFacetIdsAlias).then((facetIds) => {
          const expectedFacetIds = Cypress.$.makeArray(facetIds);
          expect(effectiveFacetIds).to.deep.equal(expectedFacetIds);
        });
      });
    },
  };
};

export const FacetManagerExpectations = {
  ...facetManagerExpectations(FacetManagerSelectors),
};
