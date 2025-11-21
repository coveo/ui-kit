import {facetManagerComponent} from './facet-manager-actions';

export function assertHasNumberOfExpandedFacets(
  numberOfExpandedFacets: number
) {
  cy.get(facetManagerComponent)
    .children()
    .each(($child, index) => {
      if (index + 1 > numberOfExpandedFacets) {
        return;
      }
      cy.wrap($child).should('not.have.attr', 'is-collapsed');
    });
}

export function assertFacetsNoCollapsedAttribute() {
  cy.get(facetManagerComponent)
    .children()
    .each(($child) => {
      cy.wrap($child).should('not.have.attr', 'is-collapsed');
    });
}


