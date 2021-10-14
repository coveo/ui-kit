import {
  BaseFacetSelector,
  FacetWithValuesSelector,
  FacetWithSearchSelector,
  FacetWithShowMoreLessSelector,
} from '../facet-common-selectors';

export const gategoryFacetComponent = 'c-quantic-category-facet';

export type AllFacetSelectors = BaseFacetSelector &
  FacetWithValuesSelector &
  FacetWithSearchSelector &
  FacetWithShowMoreLessSelector;

export const CategoryFacetSelectors: AllFacetSelectors = {
  get: () => cy.get(gategoryFacetComponent),

  label: () => CategoryFacetSelectors.get().find('header h2 > span'),
  values: () => CategoryFacetSelectors.get().find('c-quantic-facet-value'),
  clearFilterButton: () =>
    CategoryFacetSelectors.get().find('.facet__clear-filter'),
  valueLabel: () =>
    CategoryFacetSelectors.get().find('.facet__value-text span'),
  facetValueLabelAtIndex: (index: number) =>
    CategoryFacetSelectors.valueLabel().eq(index),
  collapseButton: () => CategoryFacetSelectors.get().find('.facet__collapse'),
  expandButton: () => CategoryFacetSelectors.get().find('.facet__expand'),
  placeholder: () =>
    CategoryFacetSelectors.get().find('.placeholder__card-container'),

  selectedCheckbox: () =>
    CategoryFacetSelectors.get().find('input[type="checkbox"]:checked'),
  idleCheckbox: () =>
    CategoryFacetSelectors.get().find('input[type="checkbox"]:not(:checked)'),
  selectedValue: () =>
    CategoryFacetSelectors.get().find(
      '.facet__value-text.facet__value_selected'
    ),
  idleValue: () =>
    CategoryFacetSelectors.get().find('.facet__value-text.facet__value_idle'),
  checkbox: () => CategoryFacetSelectors.get().find('.slds-checkbox'),

  searchInput: () => CategoryFacetSelectors.get().find('input[type="search"]'),
  searchClearButton: () =>
    CategoryFacetSelectors.get().find('button[data-element-id="searchClear"]'),
  moreMatches: () =>
    CategoryFacetSelectors.get().find('.facet__search-results_more-matches'),
  noMatches: () =>
    CategoryFacetSelectors.get().find('.facet__search-results_no-match'),
  valueHighlight: () =>
    CategoryFacetSelectors.get().find('.facet__search-result_highlight'),

  showLessButton: () => CategoryFacetSelectors.get().find('.facet__show-less'),
  showMoreButton: () => CategoryFacetSelectors.get().find('.facet__show-more'),
};
