export const FacetSelectors = {
  facetStandard: 'atomic-facet',
  facetSearchbox: 'input[part="search-input"]',
  checkbox: 'input[type="checkbox"]',
  showMoreButton: 'button[part="show-more"]',
  showLessButton: 'button[part="show-less"]',
  clearAllButton: 'button[part="reset-button"]',
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

export function createAliasShadow(field: string) {
  const facetSelector = `${FacetSelectors.facetStandard}[field="${field}"]`;
  cy.get(facetSelector).shadow().find('div.facet div').as('facetShadow');
}
export function createAliasFacetUL(field: string) {
  createAliasShadow(field);
  cy.get('@facetShadow').find('div:nth-child(2) ul').as('facet_ul');
}
