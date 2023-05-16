import {ComponentErrorSelector} from '../../common-selectors';
import {
  BaseFacetSelector,
  FacetWithValuesSelector,
  FacetWithSearchSelector,
  FacetWithShowMoreLessSelector,
} from '../facet-common-selectors';

export const facetComponent = 'c-quantic-facet';

export type AllFacetSelectors = BaseFacetSelector &
  FacetWithValuesSelector &
  FacetWithSearchSelector &
  FacetWithShowMoreLessSelector;

export const FacetSelectors: AllFacetSelectors & ComponentErrorSelector = {
  get: () => cy.get(facetComponent),

  label: () => FacetSelectors.get().find('header .card__header > span'),
  values: () => FacetSelectors.get().find('c-quantic-facet-value'),
  clearFilterButton: () => FacetSelectors.get().find('.facet__clear-filter'),
  valueLabel: () => FacetSelectors.get().find('.facet__value-text span'),
  facetValueLabelAtIndex: (index: number) =>
    FacetSelectors.valueLabel().eq(index),
  collapseButton: () => FacetSelectors.get().find('.facet__collapse'),
  expandButton: () => FacetSelectors.get().find('.facet__expand'),
  placeholder: () => FacetSelectors.get().find('.placeholder__card-container'),

  selectedCheckbox: () =>
    FacetSelectors.get().find('input[type="checkbox"]:checked'),
  idleCheckbox: () =>
    FacetSelectors.get().find('input[type="checkbox"]:not(:checked)'),
  selectedValue: () =>
    FacetSelectors.get().find('.facet__value-text.facet__value_selected'),
  idleValue: () =>
    FacetSelectors.get().find('.facet__value-text.facet__value_idle'),
  checkbox: () => FacetSelectors.get().find('.slds-checkbox'),

  searchInput: () => FacetSelectors.get().find('input[type="search"]'),
  searchClearButton: () =>
    FacetSelectors.get().find('button[data-element-id="searchClear"]'),
  moreMatches: () =>
    FacetSelectors.get().find('.facet__search-results_more-matches'),
  noMatches: () => FacetSelectors.get().find('.facet__search-results_no-match'),
  valueHighlight: () =>
    FacetSelectors.get().find('.facet__search-result_highlight'),
  searchValue: (caption: string) =>
    FacetSelectors.get().find('.facet__value-text').contains(caption),

  showLessButton: () => FacetSelectors.get().find('.facet__show-less'),
  showMoreButton: () => FacetSelectors.get().find('.facet__show-more'),

  componentError: () => FacetSelectors.get().find('c-quantic-component-error'),
  componentErrorMessage: () =>
    FacetSelectors.get().find(
      'c-quantic-component-error [data-cy="error-message"]'
    ),
};
