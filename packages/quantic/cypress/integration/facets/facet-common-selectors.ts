import {ComponentSelector, CypressSelector} from '../common-selectors';

export interface BaseFacetSelector extends ComponentSelector {
  label: () => CypressSelector;
  values: () => CypressSelector;
  clearFilterButton: () => CypressSelector;
  valueLabel: () => CypressSelector;
  facetValueLabelAtIndex: (index: number) => CypressSelector;
  collapseButton: () => CypressSelector;
  expandButton: () => CypressSelector;
}

export interface FacetWithValuesSelector extends ComponentSelector {
  selectedCheckbox: () => CypressSelector;
  idleCheckbox: () => CypressSelector;
  selectedValue: () => CypressSelector;
  idleValue: () => CypressSelector;
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
