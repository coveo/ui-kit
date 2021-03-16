export const FacetSelectors = {
  facetStandard: 'atomic-facet',
  facetSearchbox: 'input[part="search-input"]',
  checkbox: 'input[type="checkbox"]',
  showMoreButton: 'button[part="show-more"]',
  showLessButton: 'button[part="show-less"]',
  clearAllButton: 'button[part="reset-button"]',
  facetNumeric: 'atomic-numeric-facet',
  facetDate: 'atomic-date-facet',
};

export const BreadcrumbSelectors = {
  breadcrumb: 'atomic-breadcrumb-manager',
};
export function createBreadcrumbShadowAlias() {
  cy.get(BreadcrumbSelectors.breadcrumb)
    .shadow()
    .find('.breadcrumbs')
    .as('breadcrumbFacet');
  cy.get(BreadcrumbSelectors.breadcrumb)
    .shadow()
    .find('.breadcrumb-clear')
    .as('breadcrumbClearAllFilter');
}

export function createAliasShadow(field: string, facetMainSelector?: string) {
  facetMainSelector = facetMainSelector
    ? facetMainSelector
    : FacetSelectors.facetStandard;
  const facetSelector = `${facetMainSelector}[field="${field}"]`;
  cy.get(facetSelector).shadow().find('div.facet div').as('facetShadow');
}
export function createAliasFacetUL(field: string, facetMainSelector?: string) {
  createAliasShadow(field, facetMainSelector);
  cy.get('@facetShadow').find('ul').as('facet_ul');
  cy.get('@facet_ul').find('li:nth-child(1)').as('firstFacetValue');
  cy.get('@facet_ul').find('li:nth-child(2)').as('secondFacetValue');
  cy.get('@facet_ul').find('label span:nth-child(1)').as('allFacetValueLabel');
  cy.get('@facet_ul').find('label span:nth-child(2)').as('allFacetValueCount');
}
