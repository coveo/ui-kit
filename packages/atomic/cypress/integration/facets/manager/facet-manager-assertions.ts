import {facetManagerComponent} from './facet-manager-actions';

export function assertHasNumberOfExpandedFacets(
  numberOfExpandedFacets: number
) {
  cy.get(facetManagerComponent)
    .children()
    .each(($child, index) => {
      if (index + 1 > numberOfExpandedFacets) {
        cy.wrap($child)
          .should('have.attr', 'is-collapsed')
          .and('not.equal', 'false');
        return;
      }
      cy.wrap($child).should('have.attr', 'is-collapsed', 'false');
    });
}

export function assertFacetsNoCollapsedAttribute() {
  cy.get(facetManagerComponent)
    .children()
    .each(($child) => {
      cy.wrap($child).should('not.have.attr', 'is-collapsed');
    });
}
