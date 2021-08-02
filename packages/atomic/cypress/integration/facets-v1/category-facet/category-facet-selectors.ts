// TODO: move breadcrumb selectors out
export const breadcrumbComponent = 'atomic-breadcrumb-manager';
export const BreadcrumbSelectors = {
  shadow: () => cy.get(breadcrumbComponent).shadow(),
  breadcrumbButton: () =>
    BreadcrumbSelectors.shadow().find('[part="breadcrumb"]'),
};

export const categoryFacetComponent = 'atomic-category-facet-v1';
export const CategoryFacetSelectors = {
  shadow: () => cy.get(categoryFacetComponent).shadow(),
  wrapper: () => CategoryFacetSelectors.shadow().find('[part="facet"]'),
  labelButton: () =>
    CategoryFacetSelectors.shadow().find('[part="label-button"]'),
  placeholder: () =>
    CategoryFacetSelectors.shadow().find('[part="placeholder"]'),
  clearButton: () =>
    CategoryFacetSelectors.shadow().find('[part="all-categories-button"]'),
  valueLabel: () =>
    CategoryFacetSelectors.shadow().find('[part="value-label"]'),
  values: () => CategoryFacetSelectors.shadow().find('[part="values"]'),
  selectedLinkValue: () =>
    CategoryFacetSelectors.shadow().find(
      '[part="value-link"][aria-pressed="true"]'
    ),
  idleLinkValue: () =>
    CategoryFacetSelectors.shadow().find(
      '[part="value-link"][aria-pressed="false"]'
    ),
  valueCount: () =>
    CategoryFacetSelectors.shadow().find('[part="value-count"]'),
  parentValue: () =>
    CategoryFacetSelectors.shadow().find('[part="parent-button"]'),
  activeParentValue: () =>
    CategoryFacetSelectors.shadow().find('[part="active-parent"]'),
  showMoreButton: () =>
    CategoryFacetSelectors.shadow().find('[part="show-more"]'),
  showLessButton: () =>
    CategoryFacetSelectors.shadow().find('[part="show-less"]'),
};
