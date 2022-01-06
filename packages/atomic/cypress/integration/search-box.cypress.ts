import {TestFixture} from '../fixtures/test-fixture';
import {SafeStorage, StorageItems} from '../../src/utils/local-storage-utils';
import {SearchBoxSelectors} from './search-box-selectors';
import {addSearchBox} from './search-box-actions';
import * as CommonAssertions from './common-assertions';
import * as SearchBoxAssertions from './search-box-assertions';

const setSuggestions = (count: number) => () => {
  cy.intercept(
    {method: 'POST', path: '**/rest/search/v2/querySuggest?*'},
    (request) => {
      request.reply((response) => {
        const newResponse = response.body;
        newResponse.completions = Array.from({length: count}, (_, i) => ({
          expression: `query-suggestion-${i}`,
          executableConfidence: 0,
          highlighted: `Suggestion ${i}`,
          score: 0,
        }));
        response.send(200, newResponse);
      });
    }
  );
};

const setRecentQueries = (count: number) => () => {
  new SafeStorage().setJSON(
    StorageItems.RECENT_QUERIES,
    Array.from({length: count}, (_, i) => `Recent query ${i}`)
  );
};

describe('Search Box Test Suites', () => {
  describe('with maxWithoutQuery capping suggestions & recentQueries', () => {
    const numOfSuggestions = 6;
    const numOfRecentQueries = 4;
    const maxSuggestionsWithoutQuery = numOfSuggestions - 1;
    const maxRecentQueriesWithoutQuery = numOfRecentQueries - 1;
    beforeEach(() => {
      new TestFixture()
        .with(setSuggestions(numOfSuggestions))
        .with(setRecentQueries(numOfRecentQueries))
        .with(
          addSearchBox({
            suggestions: {
              maxWithoutQuery: maxSuggestionsWithoutQuery,
              maxWithQuery: numOfSuggestions,
            },
            recentQueries: {
              maxWithoutQuery: maxRecentQueriesWithoutQuery,
              maxWithQuery: numOfRecentQueries,
            },
            props: {'number-of-queries': numOfSuggestions + numOfRecentQueries},
          })
        )
        .init();
    });

    describe('without input', () => {
      const expectedSum =
        maxSuggestionsWithoutQuery + maxRecentQueriesWithoutQuery;
      beforeEach(() => {
        SearchBoxSelectors.inputBox().click();
      });

      SearchBoxAssertions.assertHasSuggestionsCount(expectedSum);
      CommonAssertions.assertAriaLiveMessage(
        SearchBoxSelectors.liveRegion,
        expectedSum.toString()
      );
    });

    describe('with input', () => {
      const expectedSum = numOfSuggestions + numOfRecentQueries;
      beforeEach(() => {
        SearchBoxSelectors.inputBox().type('Rec');
      });

      SearchBoxAssertions.assertHasSuggestionsCount(expectedSum);
      CommonAssertions.assertAriaLiveMessage(
        SearchBoxSelectors.liveRegion,
        expectedSum.toString()
      );

      describe('after selecting a suggestion with the mouse', () => {
        beforeEach(() => {
          SearchBoxSelectors.querySuggestions().eq(1).click();
          cy.wait(TestFixture.interceptAliases.Search);
        });

        SearchBoxAssertions.assertFocusSearchBox();
        SearchBoxAssertions.assertHasText('Recent query 1');
      });

      describe('after focusing a suggestion with the keyboard', () => {
        beforeEach(() => {
          SearchBoxSelectors.inputBox()
            .focus()
            .type('{downarrow}{downarrow}{downarrow}');
        });

        SearchBoxAssertions.assertHasText('Recent query 1');

        describe('after pressing the search button', () => {
          beforeEach(() => {
            SearchBoxSelectors.submitButton().click();
            cy.wait(TestFixture.interceptAliases.Search);
          });

          SearchBoxAssertions.assertFocusSearchBox();
          SearchBoxAssertions.assertHasText('Recent query 1');
        });
      });
    });
  });

  describe('with no suggestions nor recentQueries', () => {
    beforeEach(() => {
      new TestFixture()
        .with(setSuggestions(0))
        .with(setRecentQueries(0))
        .with(addSearchBox())
        .init();
      SearchBoxSelectors.inputBox().click();
    });

    CommonAssertions.assertAriaLiveMessage(
      SearchBoxSelectors.liveRegion,
      ' no '
    );
  });
});
