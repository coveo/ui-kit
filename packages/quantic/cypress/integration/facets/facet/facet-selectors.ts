import {
  BaseFacetSelector,
  FacetWithCheckboxSelector,
  FacetWithSearchSelector,
  FacetWithShowMoreLessSelector,
} from '../facet-common-selectors';

export const facetComponent = 'c-quantic-facet';

export type AllFacetSelectors = BaseFacetSelector &
  FacetWithCheckboxSelector &
  FacetWithSearchSelector &
  FacetWithShowMoreLessSelector;

export const FacetSelectors: AllFacetSelectors = {
  get: () => cy.get(facetComponent),

  label: () => FacetSelectors.get().find('.slds-card__header-title'),
  values: () => FacetSelectors.get().find('c-quantic-facet-value'),
  clearButton: () => FacetSelectors.get().find('button[value="Clear"]'),
  valueLabel: () => FacetSelectors.get().find('.facet__value-text span'),
  facetValueLabelAtIndex: (index: number) =>
    FacetSelectors.valueLabel().eq(index),
  collapseButton: () => FacetSelectors.get().find('.facet__collapse'),
  expandButton: () => FacetSelectors.get().find('.facet__collapse'),

  selectedCheckboxValue: () =>
    FacetSelectors.get().find('.facet__value-text.facet__value_selected'),

  idleCheckboxValue: () =>
    FacetSelectors.get().find('.facet__value-text.facet__value_idle'),

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
