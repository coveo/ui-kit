import {automaticFacetComponent} from '../automatic-facet/automatic-facet-selectors';

export const automaticFacetGeneratorComponent =
  'atomic-automatic-facet-generator';

export function assertContainsAutomaticFacet() {
  cy.get(automaticFacetGeneratorComponent).find(automaticFacetComponent);
}

export function assertDisplayPlaceholder() {
  cy.get(automaticFacetGeneratorComponent).find('[part="placeholder"]');
}

export function assertDisplayNothing() {
  cy.get(automaticFacetGeneratorComponent).children().should('not.exist');
}

export function assertDesiredCountIsDefaultValue() {
  cy.get(automaticFacetGeneratorComponent)
    .invoke('attr', 'desired-count')
    .should('eq', '5');
}

export function assertNumberOfValuesIsDefaultValue() {
  cy.get(automaticFacetGeneratorComponent)
    .invoke('attr', 'number-of-values')
    .should('eq', '8');
}
