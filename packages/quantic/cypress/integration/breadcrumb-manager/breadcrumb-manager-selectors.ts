import {ComponentSelector, CypressSelector} from '../common-selectors';

export const breadcrumbManager = 'c-quantic-breadcrumb-manager';

export interface BreadcrumbSelector extends ComponentSelector {
  label: () => CypressSelector;
  values: () => CypressSelector;
  showMoreButton: () => CypressSelector;
  breadcrumbValueLabelAtIndex: (index: number) => CypressSelector;
}

interface BreadcrumbManagerSelector extends ComponentSelector {
  facet: () => BreadcrumbSelector;
  categoryFacet: () => BreadcrumbSelector;
  numericFacet: () => BreadcrumbSelector;
  dateFacet: () => BreadcrumbSelector;
  clearFilters: () => CypressSelector;
}

const FacetBreadcrumbSelectors: BreadcrumbSelector = {
  get: () => cy.get('.facetBreadcrumb__list'),
  label: () =>
    FacetBreadcrumbSelectors.get().find('.breadcrumb-manager__field-name'),
  values: () => FacetBreadcrumbSelectors.get().find('c-quantic-pill'),
  breadcrumbValueLabelAtIndex: (index: number) =>
    FacetBreadcrumbSelectors.get().find('.pill__text-container').eq(index),
  showMoreButton: () =>
    FacetBreadcrumbSelectors.get().find('.breadcrumb-manager__more-button'),
};

const NumericFacetBreadcrumbSelectors: BreadcrumbSelector = {
  get: () => cy.get('.numericFacetBreadcrumb__list'),
  label: () =>
    NumericFacetBreadcrumbSelectors.get().find(
      '.breadcrumb-manager__field-name'
    ),
  values: () => NumericFacetBreadcrumbSelectors.get().find('c-quantic-pill'),
  breadcrumbValueLabelAtIndex: (index: number) =>
    NumericFacetBreadcrumbSelectors.get()
      .find('.pill__text-container')
      .eq(index),
  showMoreButton: () =>
    NumericFacetBreadcrumbSelectors.get().find(
      '.breadcrumb-manager__more-button'
    ),
};

const CategoryFacetBreadcrumbSelectors: BreadcrumbSelector = {
  get: () => cy.get('.categoryFacetBreadcrumb__list'),
  label: () =>
    CategoryFacetBreadcrumbSelectors.get().find(
      '.breadcrumb-manager__field-name'
    ),
  values: () => CategoryFacetBreadcrumbSelectors.get().find('c-quantic-pill'),
  breadcrumbValueLabelAtIndex: (index: number) =>
    CategoryFacetBreadcrumbSelectors.get()
      .find('.pill__text-container')
      .eq(index),
};

const DateFacetBreadcrumbSelectors: BreadcrumbSelector = {
  get: () => cy.get('.dateFacetBreadcrumb__list'),
  label: () =>
    DateFacetBreadcrumbSelectors.get().find('.breadcrumb-manager__field-name'),
  values: () => DateFacetBreadcrumbSelectors.get().find('c-quantic-pill'),
  breadcrumbValueLabelAtIndex: (index: number) =>
    DateFacetBreadcrumbSelectors.get().find('.pill__text-container').eq(index),
  showMoreButton: () =>
    DateFacetBreadcrumbSelectors.get().find('.breadcrumb-manager__more-button'),
};

export const BreadcrumbManagerSelectors: BreadcrumbManagerSelector = {
  get: () => cy.get(breadcrumbManager),
  facet: () => FacetBreadcrumbSelectors,
  numericFacet: () => NumericFacetBreadcrumbSelectors,
  dateFacet: () => DateFacetBreadcrumbSelectors,
  categoryFacet: () => CategoryFacetBreadcrumbSelectors,
  clearFilters: () =>
    BreadcrumbManagerSelectors.get().find('.breadcrumb-manager__clear-button'),
};
