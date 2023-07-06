import {AriaLiveSelectors} from '../aria-live-selectors';

export const searchBoxComponent = 'atomic-search-box';

export const SearchBoxSelectors = {
  host: () => cy.get(searchBoxComponent),
  shadow: () => cy.get(searchBoxComponent).shadow(),
  inputBox: () => SearchBoxSelectors.shadow().find('[part="input"]'),
  submitButton: () =>
    SearchBoxSelectors.shadow().find('[part="submit-button"]'),
  querySuggestionsWrapper: () =>
    SearchBoxSelectors.shadow().find('[part="suggestions-wrapper"]'),
  querySuggestions: () => SearchBoxSelectors.shadow().find('[data-query]'),
  querySuggestion: (query: string) =>
    SearchBoxSelectors.shadow().find(`[data-query="${query}"]`),
  searchBoxAriaLive: () => AriaLiveSelectors.region('search-box'),
  suggestionsAriaLive: () => AriaLiveSelectors.region('search-suggestions'),
  recentQueriesItem: () =>
    SearchBoxSelectors.shadow().find('[part~="recent-query-item"]'),
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
