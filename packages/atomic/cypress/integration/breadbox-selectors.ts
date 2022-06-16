export const breadboxComponent = 'atomic-breadbox';
export const BreadboxSelectors = {
  shadow: () => cy.get(breadboxComponent).shadow(),
  wrapper: () => BreadboxSelectors.shadow().find('div'),
  breadboxLabel: () => BreadboxSelectors.shadow().find('[part="label"]'),
  breadcrumbButton: () =>
    BreadboxSelectors.shadow().find('[part="breadcrumb-button"]'),
  breadcrumbButtonLabel: () =>
    BreadboxSelectors.breadcrumbButton().find('[part="breadcrumb-label"]'),
  breadcrumbButtonValue: () =>
    BreadboxSelectors.breadcrumbButton().find('[part="breadcrumb-value"]'),
  breadcrumbValueAtIndex: (index: number) =>
    BreadboxSelectors.breadcrumbButtonValue().eq(index),
  breadcrumbClearFacetValueButton: () =>
    BreadboxSelectors.breadcrumbButton().find('atomic-icon'),
  breadcrumbClearFacetValueButtonAtIndex: (index: number) =>
    BreadboxSelectors.breadcrumbClearFacetValueButton().eq(index),
  clearAllButton: () => BreadboxSelectors.shadow().find('[part="clear"]'),
  breadcrumbShowMoreButton: () =>
    BreadboxSelectors.wrapper().find('[part="show-more"]'),
  breadcrumbShowLessButton: () =>
    BreadboxSelectors.wrapper().find('[part="show-less"]'),
};
