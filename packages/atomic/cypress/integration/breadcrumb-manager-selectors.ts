export const breadcrumbComponent = 'atomic-breadcrumb-manager';

export const BreadcrumbSelector = {
  shadow: () => cy.get(breadcrumbComponent).shadow(),
  breadcrumbClearAllFilter: () =>
    BreadcrumbSelector.shadow().find('[part="breadcrumb-clear-all"]'),
  breadcrumbTitles: () =>
    BreadcrumbSelector.shadow().find('[part="breadcrumb"][title]'),
  breadcrumbShowMoreButton: () =>
    BreadcrumbSelector.shadow().find('[part="breadcrumb"]'),
  breadcrumbValueAtIndex: (facetLabel: string, index: number) =>
    BreadcrumbSelector.shadow()
      .find(`span[title="${facetLabel}"]`)
      .parent()
      .find('ul[part="breadcrumbs"]')
      .find('li')
      .eq(index),
};
