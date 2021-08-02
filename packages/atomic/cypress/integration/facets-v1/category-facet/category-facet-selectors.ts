// TODO: move breadcrumb selectors out
export const breadcrumbComponent = 'atomic-breadcrumb-manager';
export const BreadcrumbSelectors = {
  shadow: () => cy.get(breadcrumbComponent).shadow(),
  breadcrumbButton: () =>
    BreadcrumbSelectors.shadow().find('[part="breadcrumb"]'),
};

export const categoryFacetComponent = 'atomic-category-facet';
export const CategoryFacetSelectors = {
  shadow: () => cy.get(categoryFacetComponent).shadow(),
  wrapper: () => CategoryFacetSelectors.shadow().find('[part="facet"]'),
  label: () => CategoryFacetSelectors.shadow().find('[part="label"]'),
  placeholder: () =>
    CategoryFacetSelectors.shadow().find('[part="placeholder"]'),
  clearButton: () =>
    CategoryFacetSelectors.shadow().find('[part="clear-button"]'),
  valueLabel: () =>
    CategoryFacetSelectors.shadow().find('[part="value-label"]'),
  valueCount: () =>
    CategoryFacetSelectors.shadow().find('[part="value-count"]'),
  childValue: () => CategoryFacetSelectors.shadow().find('[part="child"]'),
  parentValue: () => CategoryFacetSelectors.shadow().find('[part="parent"]'),
  activeParentValue: () =>
    CategoryFacetSelectors.shadow().find('[part="active-parent"]'),
  showMoreButton: () =>
    CategoryFacetSelectors.shadow().find('[part="show-more"]'),
  showLessButton: () =>
    CategoryFacetSelectors.shadow().find('[part="show-less"]'),
};
