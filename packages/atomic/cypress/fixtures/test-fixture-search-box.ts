import {addTag, TagProps, TestFixture} from './test-fixture';

export const SearchBoxSelectors = {
  component: 'atomic-search-box',
  inputBox: 'input',
  querySuggestionList: 'ul',
};

export const Aliases = {
  searchBoxFirstDiv: 'searchBoxFirstDiv',
};

export const ButtonText = {
  search: 'Search',
  clear: 'Clear',
};

export const addSearchBox = (props: TagProps = {}) => (env: TestFixture) =>
  addTag(env, 'atomic-search-box', props);

export const searchBoxAlias = () => (env: TestFixture) => {
  cy.get(SearchBoxSelectors.component)
    .shadow()
    .find('div')
    .first()
    .as(Aliases.searchBoxFirstDiv);
};
