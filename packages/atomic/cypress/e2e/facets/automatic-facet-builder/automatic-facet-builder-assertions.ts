import {automaticFacetComponent} from '../automatic-facet/automatic-facet-selectors';

export const automaticFacetBuilderComponent = 'atomic-automatic-facet-builder';

export function assertContainsAutomaticFacet() {
  cy.get(automaticFacetBuilderComponent).find(automaticFacetComponent);
}
