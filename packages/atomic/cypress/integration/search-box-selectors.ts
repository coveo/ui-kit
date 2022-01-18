import {AriaLiveSelectors} from './aria-live-selectors';

export const searchBoxComponent = 'atomic-search-box';

export const SearchBoxSelectors = {
  shadow: () => cy.get(searchBoxComponent).shadow(),
  inputBox: () => SearchBoxSelectors.shadow().find('[part="input"]'),
  submitButton: () =>
    SearchBoxSelectors.shadow().find('[part="submit-button"]'),
  querySuggestions: () => SearchBoxSelectors.shadow().find('[data-query]'),
  liveRegion: () => AriaLiveSelectors.region('search-box'),
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
