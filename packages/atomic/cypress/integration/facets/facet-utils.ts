import {
  FacetSelectors,
  FacetAlias,
  BreadcrumbAlias,
} from '../facets/facet/facet-selectors';

export function facetValueShouldDisplayInBreadcrumb(
  facetValueSelector: string,
  nthBreadcrumb: number
) {
  cy.get(facetValueSelector)
    .find(FacetSelectors.labelText)
    .invoke('text')
    .then((text) => {
      cy.get(BreadcrumbAlias.breadcrumbFacet)
        .first()
        .find(`li:nth-child(${nthBreadcrumb})`)
        .should('be.visible')
        .contains(text);
    });
}

export function clickOnCategoryFacetWithValue(value: string) {
  cy.get(FacetAlias.facetUL)
    .find(FacetSelectors.categoryFacetNextLevelButton)
    .contains(value)
    .click();
}

export function clickOnNthCategoryFacet(number: number) {
  cy.get(FacetAlias.facetUL)
    .find(FacetSelectors.categoryFacetNextLevelButton)
    .eq(number)
    .click();
}

export function clickOnNthFacet(number: number) {
  cy.get(FacetAlias.facetUL).find(FacetSelectors.checkbox).eq(number).click();
}
