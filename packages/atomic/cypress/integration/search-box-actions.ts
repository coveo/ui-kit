import {
  TagProps,
  TestFixture,
  generateComponentHTML,
} from '../fixtures/test-fixture';
import {searchBoxComponent} from './search-box-selectors';

export interface AddSearchBoxOptions {
  suggestions?: {maxWithoutQuery: number; maxWithQuery: number};
  recentQueries?: {maxWithoutQuery: number; maxWithQuery: number};
  props?: TagProps;
}

export const addSearchBox =
  (options: AddSearchBoxOptions = {}) =>
  (env: TestFixture) => {
    const searchBox = generateComponentHTML(
      searchBoxComponent,
      options?.props ?? {}
    );
    if (options?.suggestions !== undefined) {
      searchBox.appendChild(
        generateComponentHTML('atomic-search-box-query-suggestions', {
          'max-without-query': options.suggestions.maxWithoutQuery,
          'max-with-query': options.suggestions.maxWithQuery,
        })
      );
    }
    if (options?.recentQueries !== undefined) {
      searchBox.appendChild(
        generateComponentHTML('atomic-search-box-recent-queries', {
          'max-without-query': options.recentQueries.maxWithoutQuery,
          'max-with-query': options.recentQueries.maxWithQuery,
        })
      );
    }
    env.withElement(searchBox);
  };
