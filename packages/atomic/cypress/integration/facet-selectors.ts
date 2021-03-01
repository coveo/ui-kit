export const FacetSelectors = {
  facetStandard: 'atomic-facet',
  showMoreButton: 'button[part="show-more"]',
  showLessButton: 'button[part="show-less"]',
};

export function createAliasShadow(field: string) {
  const facetSelector = `${FacetSelectors.facetStandard}[field="${field}"]`;
  cy.get(facetSelector).shadow().find('div.facet div').as('facetShadow');
}
export function createAliasFacetUL(field: string) {
  createAliasShadow(field);
  cy.get('@facetShadow').find('div:nth-child(2) ul').as('facet_ul');
}
