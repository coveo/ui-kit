// TODO: move breadcrumb selectors out
export const breadcrumbComponent = 'atomic-breadcrumb-manager';
export const BreadcrumbSelectors = {
  shadow: () => cy.get(breadcrumbComponent).shadow(),
  breadcrumbButton: () =>
    BreadcrumbSelectors.shadow().find('[part="breadcrumb"]'),
};

export const categoryFacetComponent = 'atomic-category-facet';
export const CategoryFacetSelectors = {
  withId(id: string) {
    return {
      ...this,
      shadow() {
        return cy.get(`${categoryFacetComponent}[facet-id="${id}"]`).shadow();
      },
    };
  },
  shadow() {
    return cy.get(categoryFacetComponent).shadow();
  },
  wrapper() {
    return this.shadow().find('[part="facet"]');
  },
  labelButton() {
    return this.shadow().find('[part="label-button"]');
  },
  placeholder() {
    return this.shadow().find('[part="placeholder"]');
  },
  clearButton() {
    return this.shadow().find('[part="clear-button"]');
  },
  allCategoriesButton() {
    return this.shadow().find('[part="all-categories-button"]');
  },
  valueLabel() {
    return this.shadow().find('[part="value-label"]');
  },
  values() {
    return this.shadow().find('[part="values"]');
  },
  childValue() {
    return this.shadow().find('[part="value-link"]');
  },
  childValueLabel() {
    return this.childValue().find('[part="value-label"]');
  },
  valueCount() {
    return this.shadow().find('[part="value-count"]');
  },
  parentValue() {
    return this.shadow().find('[part="parent-button"]');
  },
  activeParentValue() {
    return this.shadow().find('[part="active-parent"]');
  },
  activeParentValueWithText(text: string) {
    return this.shadow().find(`[part="active-parent"]:contains("${text}")`);
  },
  showMoreButton() {
    return this.shadow().find('[part="show-more"]');
  },
  showLessButton() {
    return this.shadow().find('[part="show-less"]');
  },
  searchInput() {
    return this.shadow().find('[part="search-input"]');
  },
  searchClearButton() {
    return this.shadow().find('[part="search-clear-button"]');
  },
  searchResults() {
    return this.shadow().find('[part="search-results"]');
  },
  searchResult() {
    return this.shadow().find('[part="search-result"]');
  },
  searchResultPath() {
    return this.shadow().find('[part="search-result-path"]');
  },
  moreMatches() {
    return this.shadow().find('[part="more-matches"]');
  },
  noMatches() {
    return this.shadow().find('[part="no-matches"]');
  },
  valueHighlight() {
    return this.shadow().find('[part="search-highlight"]');
  },
};
