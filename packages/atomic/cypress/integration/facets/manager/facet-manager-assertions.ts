import {facetManagerComponent} from './facet-manager-actions';

export function assertHasNumberOfExpandedFacets(
  numberOfExpandedFacets: number
) {
  cy.get(facetManagerComponent)
    .children()
    .each(($child, index) => {
      cy.wrap($child).should(
        'have.attr',
        'is-collapsed',
        index + 1 > numberOfExpandedFacets ? '' : 'false'
      );
    });
}

export function assertFacetsNoCollapsedAttribute() {
  cy.get(facetManagerComponent)
    .children()
    .each(($child) => {
      cy.wrap($child).should('not.have.attr', 'is-collapsed');
    });
}
