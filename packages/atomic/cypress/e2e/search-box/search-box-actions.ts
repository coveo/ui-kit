import {AriaLabelGenerator} from '../../../src/components/search/search-box-suggestions/atomic-search-box-instant-results/atomic-search-box-instant-results';
import {
  TagProps,
  TestFixture,
  generateComponentHTML,
} from '../../fixtures/test-fixture';
import * as SearchBoxAssertions from './search-box-assertions';
import {SearchBoxSelectors, searchBoxComponent} from './search-box-selectors';

export interface AddSearchBoxOptions {
  suggestions?: {maxWithoutQuery: number; maxWithQuery: number};
  recentQueries?: {maxWithoutQuery: number; maxWithQuery: number};
  instantResults?: {
    template?: HTMLElement;
    ariaLabelGenerator?: AriaLabelGenerator;
  };
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
    if (options?.instantResults !== undefined) {
      const instantResultsElement = document.createElement(
        'atomic-search-box-instant-results'
      );
      if (options.instantResults.template) {
        instantResultsElement.appendChild(options.instantResults.template);
      }
      if (options.instantResults.ariaLabelGenerator) {
        instantResultsElement.ariaLabelGenerator =
          options.instantResults.ariaLabelGenerator;
      }
      searchBox.appendChild(instantResultsElement);
    }
    env.withElement(searchBox);
  };

export function typeSearchTextArea(query: string, verifyInput = '') {
  SearchBoxSelectors.textArea().click();
  SearchBoxSelectors.textArea().type(`${query}{enter}`, {force: true});
  SearchBoxAssertions.assertHasText(
    verifyInput || query,
    SearchBoxSelectors.textArea
  );
}
