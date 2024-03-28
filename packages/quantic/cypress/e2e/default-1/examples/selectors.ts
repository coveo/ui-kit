import {ComponentSelector, CypressSelector} from '../../common-selectors';

export interface Selector extends ComponentSelector {
  searchbox: () => CypressSelector;
  summary: () => CypressSelector;
  facetValue: (value: string) => CypressSelector;
  pager: () => CypressSelector;
  pagerButton: (index: number) => CypressSelector;
  sort: () => CypressSelector;
  sortDropdown: () => CypressSelector;
  sortOption: (value: string) => CypressSelector;
  facetsContainer: () => CypressSelector;
  refineToggle: () => CypressSelector;
  result: () => CypressSelector;
}

export const SelectorsFactory = (interfaceComponent: string) => {
  const Selectors: Selector = {
    get: () => cy.get(interfaceComponent),

    searchbox: () =>
      Selectors.get().find('c-quantic-search-box input[type="search"]'),
    summary: () =>
      Selectors.get().find(
        'c-quantic-summary lightning-formatted-rich-text span'
      ),
    facetValue: (value: string) =>
      Selectors.get().find(
        `c-quantic-facet-value[data-cy="${value}"] input[type="checkbox"]`
      ),
    pager: () => Selectors.get().find('c-quantic-pager'),
    pagerButton: (index: number) => Selectors.pager().find('button').eq(index),
    sort: () => Selectors.get().find('c-quantic-sort').eq(0),
    sortDropdown: () => Selectors.sort().find('lightning-combobox'),
    sortOption: (value: string) =>
      Selectors.sort().find(
        `div[role="listbox"] lightning-base-combobox-item[data-value="${value}"]`
      ),
    facetsContainer: () => Selectors.get().find('.facets_container'),
    refineToggle: () => Selectors.get().find('c-quantic-refine-toggle'),
    result: () => Selectors.get().find('c-quantic-result'),
  };

  return Selectors;
};
