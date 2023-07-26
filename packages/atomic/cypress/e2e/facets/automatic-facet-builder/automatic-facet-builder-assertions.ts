import {automaticFacetComponent} from '../automatic-facet/automatic-facet-selectors';

export const automaticFacetBuilderComponent = 'atomic-automatic-facet-builder';

export function assertContainsAutomaticFacet() {
  cy.get(automaticFacetBuilderComponent).find(automaticFacetComponent);
}

export function assertCollapseAutomaticFacets(isCollapsed: boolean) {
  cy.get(automaticFacetBuilderComponent)
    .find(automaticFacetComponent)
    .shadow()
    .find('[part="values"]')
    .should(isCollapsed ? 'not.exist' : 'be.visible');
}
