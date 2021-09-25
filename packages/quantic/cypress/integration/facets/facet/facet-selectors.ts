import {
  BaseFacetSelector,
  FacetWithCheckboxSelector,
  FacetWithLinkSelector,
  FacetWithSearchSelector,
  FacetWithShowMoreLessSelector,
} from '../facet-common-selectors';

export const facetComponent = 'c-quantic-facet';

export type AllFacetSelectors = BaseFacetSelector &
  FacetWithCheckboxSelector &
  FacetWithLinkSelector &
  FacetWithSearchSelector &
  FacetWithShowMoreLessSelector;

export const FacetSelectors: AllFacetSelectors = {
  get: () => cy.get(facetComponent),

  label: () => FacetSelectors.get().find('header h2 > span'),
  values: () => FacetSelectors.get().find('c-quantic-facet-value'),
  clearFilterButton: () =>
    FacetSelectors.get().find('button[value="Clear filter"]'),
  clearMultipleFilterButton: (numberOfActiveFacets: number) =>
    FacetSelectors.get().find(
      `button[value="Clear ${numberOfActiveFacets} filters"]`
    ),
  valueLabel: () => FacetSelectors.get().find('.facet__value-text span'),
  facetValueLabelAtIndex: (index: number) =>
    FacetSelectors.valueLabel().eq(index),
  collapseButton: () => FacetSelectors.get().find('.facet__collapse'),
  expandButton: () => FacetSelectors.get().find('.facet__collapse'),

  selectedCheckboxValue: () =>
    FacetSelectors.get().find('input[type="checkbox"]:checked'),
  idleCheckboxValue: () =>
    FacetSelectors.get().find('input[type="checkbox"]:not(:checked)'),

  selectedLinkValue: () =>
    FacetSelectors.get().find('.facet__value-text.facet__value_selected'),
  idleLinkValue: () =>
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

  showLessButton: () => FacetSelectors.get().find('.facet__show-less'),
  showMoreButton: () => FacetSelectors.get().find('.facet__show-more'),
};
