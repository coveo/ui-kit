import {ComponentSelector, CypressSelector} from '../../common-selectors';

export const standaloneSearchBoxComponent = 'c-quantic-search-box';

export interface SearchBoxSelector extends ComponentSelector {
  input: (textarea?: boolean) => CypressSelector;
  quanticSearchBoxInput: () => CypressSelector;
  suggestionList: () => CypressSelector;
  searchButton: () => CypressSelector;
  clearRecentQueriesButton: () => CypressSelector;
  querySuggestions: () => CypressSelector;
  querySuggestionByIndex: (index: number) => CypressSelector;
  querySuggestionContentByIndex: (index: number) => CypressSelector;
}

export const SearchBoxSelectors: SearchBoxSelector = {
  get: () => cy.get(standaloneSearchBoxComponent),
  quanticSearchBoxInput: () =>
    SearchBoxSelectors.get().find('[data-cy="quantic-search-box-input"]'),
  input: (textarea = false) =>
    SearchBoxSelectors.get().find(
      `c-quantic-search-box-input [data-cy="${textarea ? 'search-box-textarea' : 'search-box-input'}"]`
    ),
  suggestionList: () =>
    SearchBoxSelectors.get().find(
      'c-quantic-search-box-suggestions-list [data-cy="suggestion-list"]'
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
  querySuggestionByIndex: (index: number) =>
    SearchBoxSelectors.querySuggestions().eq(index),
  querySuggestionContentByIndex: (index: number) =>
    SearchBoxSelectors.get()
      .find(
        'c-quantic-search-box-input [data-cy="suggestions-option"] lightning-formatted-rich-text'
      )
      .eq(index),
};
