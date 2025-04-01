import {ComponentSelector, CypressSelector} from '../../common-selectors';

export const standaloneSearchBoxComponent = 'c-quantic-standalone-search-box';

export interface StandaloneSearchBoxSelector extends ComponentSelector {
  input: (textarea?: boolean) => CypressSelector;
  quanticSearchBoxInput: () => CypressSelector;
  suggestionList: () => CypressSelector;
  clearButton: () => CypressSelector;
  searchIcon: () => CypressSelector;
  searchButton: () => CypressSelector;
}

export const StandaloneSearchBoxSelectors: StandaloneSearchBoxSelector = {
  get: () => cy.get(standaloneSearchBoxComponent),
  quanticSearchBoxInput: () =>
    StandaloneSearchBoxSelectors.get().find(
      '[data-cy="quantic-search-box-input"]'
    ),
  input: (textarea = false) =>
    StandaloneSearchBoxSelectors.get().find(
      textarea
        ? 'c-quantic-search-box-input [data-cy="search-box-textarea"]'
        : 'c-quantic-search-box-input [data-cy="search-box-input"]'
    ),
  suggestionList: () =>
    StandaloneSearchBoxSelectors.get().find(
      'c-quantic-search-box-input c-quantic-search-box-suggestions-list li'
    ),
  clearButton: () =>
    StandaloneSearchBoxSelectors.get().find(
      'c-quantic-search-box-input [data-cy="search-box-clear-button"]'
    ),
  searchIcon: () =>
    StandaloneSearchBoxSelectors.get().find(
      'c-quantic-search-box-input [data-cy="search-box-search-icon"]'
    ),
  searchButton: () =>
    StandaloneSearchBoxSelectors.get().find(
      'c-quantic-search-box-input [data-cy="search-box-submit-button"]'
    ),
};
