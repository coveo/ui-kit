export const SearchBoxSelectors = {
  component: 'atomic-search-box',
  inputBox: 'input',
  querySuggestionList: 'ul',
};

export const ButtonText = {
  search: 'Search',
  clear: 'Clear',
};

export function generateAliasForSearchBox() {
  cy.get(SearchBoxSelectors.component)
    .find('div')
    .first()
    .as('searchBoxFirstDiv');
  cy.get('@searchBoxFirstDiv')
    .find(SearchBoxSelectors.inputBox)
    .as('searchInput');
  cy.get('@searchBoxFirstDiv').contains(ButtonText.search).as('searchBtn');
  cy.get('@searchBoxFirstDiv')
    .find(SearchBoxSelectors.querySuggestionList)
    .as('querySuggestList');
}

export function searchAQueryUsingMouse(query: string) {
  cy.get('@searchInput').type(query, {force: true});
  cy.get('@searchBtn').click();
}
