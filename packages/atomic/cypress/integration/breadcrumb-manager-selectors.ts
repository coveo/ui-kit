export const BreadcrumbSelectors = {
  breadcrumbManager: 'atomic-breadcrumb-manager',
  breadcrumbCount: 'button[part="next-button"]',
  buttonPrevious: 'button[part="previous-button"]',
};

export function createAliasLi() {
  cy.get(BreadcrumbSelectors.breadcrumbManager)
    .shadow()
    .find('li')
    .as('breadcrumbLi');
}
