import {ComponentSelector, CypressSelector} from '../../common-selectors';

export const standaloneSearchBoxComponent = 'c-quantic-standalone-search-box';

export interface StandaloneSearchBoxSelector extends ComponentSelector {
  quanticSearchBoxInput: () => CypressSelector;
  input: (textarea?: boolean) => CypressSelector;
  suggestionList: () => CypressSelector;
  clearButton: () => CypressSelector;
  searchIcon: () => CypressSelector;
  searchButton: () => CypressSelector;
}

export const StandaloneSearchBoxSelectors: StandaloneSearchBoxSelector = {
  get: () => cy.get(standaloneSearchBoxComponent),
  quanticSearchBoxInput: () =>
    StandaloneSearchBoxSelectors.get().find('c-quantic-search-box-input'),
  input: (textarea = false) =>
    StandaloneSearchBoxSelectors.get().find(
      textarea
        ? 'c-quantic-search-box-input textarea[type="search"]'
        : 'c-quantic-search-box-input input[type="search"]'
    ),
  suggestionList: () =>
    StandaloneSearchBoxSelectors.get().find(
      'c-quantic-search-box-input c-quantic-search-box-suggestions-list li'
    ),
  clearButton: () =>
    StandaloneSearchBoxSelectors.get().find(
      'c-quantic-search-box-input button[name="Clear"]'
    ),
  searchIcon: () =>
    StandaloneSearchBoxSelectors.get().find(
      'c-quantic-search-box-input .searchbox__search-icon'
    ),
  searchButton: () =>
    StandaloneSearchBoxSelectors.get().find(
      'c-quantic-search-box-input .searchbox__submit-button'
    ),
};
