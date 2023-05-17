import {ComponentSelector, CypressSelector} from '../../common-selectors';

export const breadcrumbManager = 'c-quantic-breadcrumb-manager';

export interface BreadcrumbSelector extends ComponentSelector {
  label: () => CypressSelector;
  values: () => CypressSelector;
  showMoreButton: () => CypressSelector;
  firstBreadcrumbValueLabel: () => CypressSelector;
  firstBreadcrumbAltText: () => CypressSelector;
}

export interface BreadcrumbManagerSelector extends ComponentSelector {
  facet: () => BreadcrumbSelector;
  categoryFacet: () => BreadcrumbSelector;
  numericFacet: () => BreadcrumbSelector;
  dateFacet: () => BreadcrumbSelector;
  clearFilters: () => CypressSelector;
}

const FacetBreadcrumbSelectors: BreadcrumbSelector = {
  get: () => cy.get('.breadcrumb-manager__facet-list'),
  label: () =>
    FacetBreadcrumbSelectors.get().find('.breadcrumb-manager__field-name'),
  values: () => FacetBreadcrumbSelectors.get().find('c-quantic-pill'),
  firstBreadcrumbValueLabel: () =>
    FacetBreadcrumbSelectors.get().find('.pill__text-container').first(),
  firstBreadcrumbAltText: () =>
    FacetBreadcrumbSelectors.get().find('button.pill__container').first(),
  showMoreButton: () =>
    FacetBreadcrumbSelectors.get().find('.breadcrumb-manager__more-button'),
};

const NumericFacetBreadcrumbSelectors: BreadcrumbSelector = {
  get: () => cy.get('.breadcrumb-manager__numeric-facet-list'),
  label: () =>
    NumericFacetBreadcrumbSelectors.get().find(
      '.breadcrumb-manager__field-name'
    ),
  values: () => NumericFacetBreadcrumbSelectors.get().find('c-quantic-pill'),
  firstBreadcrumbValueLabel: () =>
    NumericFacetBreadcrumbSelectors.get().find('.pill__text-container').first(),
  firstBreadcrumbAltText: () =>
    NumericFacetBreadcrumbSelectors.get()
      .find('button.pill__container')
      .first(),
  showMoreButton: () =>
    NumericFacetBreadcrumbSelectors.get().find(
      '.breadcrumb-manager__more-button'
    ),
};

const CategoryFacetBreadcrumbSelectors: BreadcrumbSelector = {
  get: () => cy.get('.breadcrumb-manager__category-facet-list'),
  label: () =>
    CategoryFacetBreadcrumbSelectors.get().find(
      '.breadcrumb-manager__field-name'
    ),
  values: () => CategoryFacetBreadcrumbSelectors.get().find('c-quantic-pill'),
  firstBreadcrumbValueLabel: () =>
    CategoryFacetBreadcrumbSelectors.get()
      .find('.pill__text-container')
      .first(),
  firstBreadcrumbAltText: () =>
    CategoryFacetBreadcrumbSelectors.get()
      .find('button.pill__container')
      .first(),
};

const DateFacetBreadcrumbSelectors: BreadcrumbSelector = {
  get: () => cy.get('.breadcrumb-manager__date-facet-list'),
  label: () =>
    DateFacetBreadcrumbSelectors.get().find('.breadcrumb-manager__field-name'),
  values: () => DateFacetBreadcrumbSelectors.get().find('c-quantic-pill'),
  firstBreadcrumbValueLabel: () =>
    DateFacetBreadcrumbSelectors.get().find('.pill__text-container').first(),
  firstBreadcrumbAltText: () =>
    DateFacetBreadcrumbSelectors.get().find('button.pill__container').first(),
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
