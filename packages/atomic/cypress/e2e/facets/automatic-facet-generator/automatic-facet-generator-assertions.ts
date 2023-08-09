import {automaticFacetComponent} from '../automatic-facet/automatic-facet-selectors';

export const automaticFacetGeneratorComponent =
  'atomic-automatic-facet-generator';

export function assertContainsAutomaticFacet() {
  cy.get(automaticFacetGeneratorComponent).find(automaticFacetComponent);
}

export function assertCollapseAutomaticFacets(isCollapsed: boolean) {
  cy.get(automaticFacetGeneratorComponent)
    .find(automaticFacetComponent)
    .shadow()
    .find('[part="values"]')
    .should(isCollapsed ? 'not.exist' : 'be.visible');
}

export function assertDisplayPlaceholder() {
  cy.get(automaticFacetGeneratorComponent).find('[part="placeholder"]');
}
