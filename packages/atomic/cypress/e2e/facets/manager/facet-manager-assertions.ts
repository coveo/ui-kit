import {automaticFacetGeneratorComponent} from '../automatic-facet-generator/automatic-facet-generator-assertions';
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

export function assertHasNumberOfExpandedAutomaticFacets(
  numberOfExpandedAutomaticFacets: number
) {
  cy.get(automaticFacetGeneratorComponent)
    .children()
    .each(($child, index) => {
      if (index + 1 > numberOfExpandedAutomaticFacets) {
        cy.wrap($child).should('have.attr', 'is-collapsed');
        return;
      }
      cy.wrap($child).should('not.have.attr', 'is-collapsed');
    });
}
