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
    SearchBoxSelectors.get().find('[data-testid="quantic-search-box-input"]'),
  input: (textarea = false) =>
    SearchBoxSelectors.get().find(
      `c-quantic-search-box-input [data-testid="${textarea ? 'search-box-textarea' : 'search-box-input'}"]`
    ),
  suggestionList: () =>
    SearchBoxSelectors.get().find(
      'c-quantic-search-box-suggestions-list [data-testid="suggestion-list"]'
    ),
  searchButton: () =>
    SearchBoxSelectors.get().find(
      'c-quantic-search-box-input [data-testid="search-box-submit-button"]'
    ),
  clearRecentQueriesButton: () =>
    SearchBoxSelectors.get().find(
      'c-quantic-search-box-input [data-testid="clear-recent-queries-button"]'
    ),
  querySuggestions: () =>
    SearchBoxSelectors.get().find(
      'c-quantic-search-box-input [data-testid="suggestions-option"]'
    ),
  querySuggestionByIndex: (index: number) =>
    SearchBoxSelectors.querySuggestions().eq(index),
  querySuggestionContentByIndex: (index: number) =>
    SearchBoxSelectors.get()
      .find(
        'c-quantic-search-box-input [data-testid="suggestions-option"] lightning-formatted-rich-text'
      )
      .eq(index),
};
