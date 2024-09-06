import {AriaLiveSelectors} from '../aria-live-selectors';

export const searchBoxComponent = 'atomic-search-box';

export const SearchBoxSelectors = {
  host: () => cy.get(searchBoxComponent),
  shadow: () => cy.get(searchBoxComponent).shadow(),
  textArea: () => SearchBoxSelectors.shadow().find('[part="textarea"]'),
  submitButton: () =>
    SearchBoxSelectors.shadow().find('[part="submit-button"]'),
  querySuggestionsWrapper: () =>
    SearchBoxSelectors.shadow().find('[part="suggestions-wrapper"]'),
  querySuggestions: () => SearchBoxSelectors.shadow().find('[data-query]'),
  activeQuerySuggestion: () =>
    SearchBoxSelectors.shadow().find('[data-query][part~="active-suggestion"]'),
  querySuggestion: (query: string) =>
    SearchBoxSelectors.shadow().find(`[data-query="${query}"]`),
  searchBoxAriaLive: () => AriaLiveSelectors.region('search-box'),
  suggestionsAriaLive: () => AriaLiveSelectors.region('search-suggestions'),
  recentQueriesItem: () =>
    SearchBoxSelectors.shadow().find('[part~="recent-query-item"]'),
  clearButton: () => SearchBoxSelectors.shadow().find('[part="clear-button"]'),
};

export const ButtonText = {
  search: 'Search',
  clear: 'Clear',
};

export function generateAliasForSearchBox() {
  cy.get(searchBoxComponent)
    .shadow()
    .find('div')
    .first()
    .as('searchBoxFirstDiv');
}

export function searchAQueryUsingMouse(query: string) {
  cy.get('@searchInput').type(query, {force: true});
  cy.get('@searchBtn').click();
}
