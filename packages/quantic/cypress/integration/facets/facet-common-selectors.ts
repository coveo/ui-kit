import {ComponentSelector, CypressSelector} from '../common-selectors';

export interface BaseFacetSelector extends ComponentSelector {
  label: () => CypressSelector;
  values: () => CypressSelector;
  clearFilterButton: () => CypressSelector;
  clearMultipleFilterButton: (numberOfActiveFacets: number) => CypressSelector;
  valueLabel: () => CypressSelector;
  facetValueLabelAtIndex: (index: number) => CypressSelector;
  collapseButton: () => CypressSelector;
  expandButton: () => CypressSelector;
}

export interface FacetWithCheckboxSelector extends ComponentSelector {
  selectedCheckboxValue: () => CypressSelector;
  idleCheckboxValue: () => CypressSelector;
}

export interface FacetWithLinkSelector extends ComponentSelector {
  selectedLinkValue: () => CypressSelector;
  idleLinkValue: () => CypressSelector;
  checkbox: () => CypressSelector;
}

export interface FacetWithSearchSelector extends ComponentSelector {
  searchInput: () => CypressSelector;
  searchClearButton: () => CypressSelector;
  moreMatches: () => CypressSelector;
  noMatches: () => CypressSelector;
  valueHighlight: () => CypressSelector;
}

export interface FacetWithShowMoreLessSelector extends ComponentSelector {
  showLessButton: () => CypressSelector;
  showMoreButton: () => CypressSelector;
}
