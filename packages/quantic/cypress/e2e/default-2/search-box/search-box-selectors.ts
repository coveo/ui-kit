import {ComponentSelector, CypressSelector} from '../../common-selectors';

export const standaloneSearchBoxComponent = 'c-quantic-search-box';

export interface SearchBoxSelector extends ComponentSelector {
  input: (textarea?: boolean) => CypressSelector;
  quanticSearchBoxInput: () => CypressSelector;
  suggestionList: () => CypressSelector;
  searchButton: () => CypressSelector;
  clearRecentQueriesButton: () => CypressSelector;
  querySuggestions: () => CypressSelector;
  querySuggestion: (index: number) => CypressSelector;
}

export const SearchBoxSelectors: SearchBoxSelector = {
  get: () => cy.get(standaloneSearchBoxComponent),
  quanticSearchBoxInput: () =>
    SearchBoxSelectors.get().find('[data-cy="quantic-search-box-input"]'),
  input: (textarea = false) =>
    SearchBoxSelectors.get().find(
      textarea
        ? 'c-quantic-search-box-input [data-cy="search-box-textarea"]'
        : 'c-quantic-search-box-input [data-cy="search-box-input"]'
    ),
  suggestionList: () =>
    SearchBoxSelectors.get().find(
      'c-quantic-search-box-input c-quantic-search-box-suggestions-list [data-cy="suggestion-list"]'
    ),
  searchButton: () =>
    SearchBoxSelectors.get().find(
      'c-quantic-search-box-input [data-cy="search-box-submit-button"]'
    ),
  clearRecentQueriesButton: () =>
    SearchBoxSelectors.get().find(
      'c-quantic-search-box-input [data-cy="clear-recent-queries"]'
    ),
  querySuggestions: () =>
    SearchBoxSelectors.get().find(
      'c-quantic-search-box-input [data-cy="suggestions-option"]'
    ),
  querySuggestion: (index: number) =>
    SearchBoxSelectors.querySuggestions().eq(index),
};
