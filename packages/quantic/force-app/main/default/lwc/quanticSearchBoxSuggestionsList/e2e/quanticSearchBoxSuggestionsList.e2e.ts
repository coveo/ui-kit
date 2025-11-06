import {testSearch, testInsight} from './fixture';
import {
  useCaseTestCases,
} from '../../../../../../playwright/utils/useCase';
import {
  AnalyticsModeEnum,
  analyticsModeTest,
} from '../../../../../../playwright/utils/analyticsMode';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

const mockRecentQueries = [
  'recent query 1',
  'recent query 2',
  'recent query 3',
];

// The events tested by these tests are only legacy analytics events.
// There's no need to test the next analytics mode for this test suite.
const supportedAnalyticsModes = analyticsModeTest.filter(
  (analyticsProtocol) => analyticsProtocol.mode === AnalyticsModeEnum.legacy
);

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];
  test.describe(`quantic search box suggestions list ${useCase.label}`, () => {
    supportedAnalyticsModes.forEach((analytics) => {
      test.describe(analytics.label, () => {
        test.use({
          analyticsMode: analytics.mode,
        });

        test.describe('search box input interactions', () => {
          test('should display suggestions on input focus', async ({
            searchBoxSuggestionsList,
            querySuggest,
          }) => {
            const mockQuerySuggestions = [
              'Suggestion 1',
              'Suggestion 2',
              'Suggestion 3',
            ];
            querySuggest.mockQuerySuggestResponse(mockQuerySuggestions);
            const querySuggestResponsePromise =
              querySuggest.waitForQuerySuggestResponse();
            const searchBoxInput = searchBoxSuggestionsList.searchBoxInput;
            await searchBoxInput.focus();
            await querySuggestResponsePromise;

            const suggestionsList = searchBoxSuggestionsList.suggestionsList;
            test.expect(await suggestionsList.isVisible()).toBeTruthy();
            const suggestionCount =
              await searchBoxSuggestionsList.suggestionCount;
            test.expect(suggestionCount).toBe(mockQuerySuggestions.length);
          });

          test('should hide suggestions on input blur', async ({
            searchBoxSuggestionsList,
            querySuggest,
          }) => {
            const mockQuerySuggestions = [
              'Suggestion 1',
              'Suggestion 2',
              'Suggestion 3',
            ];
            querySuggest.mockQuerySuggestResponse(mockQuerySuggestions);
            const querySuggestResponsePromise =
              querySuggest.waitForQuerySuggestResponse();
            const searchBoxInput = searchBoxSuggestionsList.searchBoxInput;
            await searchBoxInput.focus();
            await querySuggestResponsePromise;

            const suggestionsList = searchBoxSuggestionsList.suggestionsList;
            test.expect(await suggestionsList.isVisible()).toBeTruthy();

            await searchBoxSuggestionsList.focusOutsideSearchBox();
            test.expect(await suggestionsList.isVisible()).toBeFalsy();
          });
        });

        test.describe('using the mouse', () => {
          test.describe('when clicking on a suggestion', () => {
            test('should send a search request and analytics with the suggestion as query', async ({
              searchBoxSuggestionsList,
              querySuggest,
              search,
            }) => {
              const mockQuerySuggestions = [
                'Suggestion 1',
                'Suggestion 2',
                'Suggestion 3',
              ];
              querySuggest.mockQuerySuggestResponse(mockQuerySuggestions);
              const querySuggestResponsePromise =
                querySuggest.waitForQuerySuggestResponse();
              const searchBoxInput = searchBoxSuggestionsList.searchBoxInput;
              await searchBoxInput.focus();
              await querySuggestResponsePromise;

              const searchAnalyticsPromise =
                searchBoxSuggestionsList.waitForQuerySuggestSearchLegacyAnalytics(
                  {
                    queryText: mockQuerySuggestions[0],
                  }
                );
              const searchRequestPromise = search.waitForSearchRequest();
              const firstSuggestion = searchBoxSuggestionsList.firstSuggestion;
              await firstSuggestion.click();
              const requestBody = (await searchRequestPromise).postDataJSON();
              test.expect(requestBody.q).toBe(mockQuerySuggestions[0]);
              await searchAnalyticsPromise;
            });
          });

          test.describe('when clicking on a recent query', () => {
            test.use({
              recentQueries: mockRecentQueries,
            });
            test('should send a search request and analytics with the recent query as query', async ({
              searchBoxSuggestionsList,
              querySuggest,
              search,
            }) => {
              const querySuggestResponsePromise =
                querySuggest.waitForQuerySuggestResponse();
              const searchBoxInput = searchBoxSuggestionsList.searchBoxInput;
              await searchBoxInput.focus();
              await querySuggestResponsePromise;

              const searchAnalyticsPromise =
                searchBoxSuggestionsList.waitForRecentQuerySearchLegacyAnalytics(
                  {
                    queryText: mockRecentQueries[0],
                  }
                );
              const searchRequestPromise = search.waitForSearchRequest();
              const secondSuggestion =
                searchBoxSuggestionsList.getSuggestionAtIndex(1); // The first item is the clear recent queries button.
              await secondSuggestion.click();
              const searchRequestBody = (
                await searchRequestPromise
              ).postDataJSON();
              test.expect(searchRequestBody.q).toBe(mockRecentQueries[0]);
              test
                .expect(searchRequestBody?.analytics?.actionCause)
                .toBe('recentQueriesClick');
              await searchAnalyticsPromise;
            });
          });

          test.describe('when clicking on the clear recent queries button', () => {
            test.use({
              recentQueries: mockRecentQueries,
            });
            test('should clear recent queries and send analytics', async ({
              searchBoxSuggestionsList,
              querySuggest,
            }) => {
              const querySuggestResponsePromise =
                querySuggest.waitForQuerySuggestResponse();
              const searchBoxInput = searchBoxSuggestionsList.searchBoxInput;
              await searchBoxInput.focus();
              await querySuggestResponsePromise;

              const clearRecentQueriesAnalyticsPromise =
                searchBoxSuggestionsList.waitForClearRecentQueriesAnalytics({});
              const firstSuggestion =
                searchBoxSuggestionsList.getSuggestionAtIndex(0); // The first item is the clear recent queries button.
              await firstSuggestion.click();
              await clearRecentQueriesAnalyticsPromise;
              const recentQueriesFromLocalStorage =
                await querySuggest.getRecentQueriesFromLocalStorage();
              test.expect(recentQueriesFromLocalStorage).toEqual([]);
            });
          });
        });

        test.describe('when using the keyboard', () => {
          test.describe('when selecting a suggestion', () => {
            test('should send a search request and analytics with the suggestion as query', async ({
              searchBoxSuggestionsList,
              querySuggest,
              search,
            }) => {
              const mockQuerySuggestions = [
                'Suggestion 1',
                'Suggestion 2',
                'Suggestion 3',
              ];
              querySuggest.mockQuerySuggestResponse(mockQuerySuggestions);
              const querySuggestResponsePromise =
                querySuggest.waitForQuerySuggestResponse();
              const searchBoxInput = searchBoxSuggestionsList.searchBoxInput;
              await searchBoxInput.focus();
              await querySuggestResponsePromise;

              const searchAnalyticsPromise =
                searchBoxSuggestionsList.waitForQuerySuggestSearchLegacyAnalytics(
                  {
                    queryText: mockQuerySuggestions[1],
                  }
                );
              const searchRequestPromise = search.waitForSearchRequest();
              // Navigate to the second suggestion using keyboard
              await searchBoxInput.press('ArrowDown');
              await searchBoxInput.press('ArrowDown');
              await searchBoxInput.press('Enter');
              const requestBody = (await searchRequestPromise).postDataJSON();
              test.expect(requestBody.q).toBe(mockQuerySuggestions[1]);
              await searchAnalyticsPromise;
            });
          });

          test.describe('when selecting a recent query', () => {
            test.use({
              recentQueries: mockRecentQueries,
            });
            test('should send a search request and analytics with the recent as query', async ({
              searchBoxSuggestionsList,
              querySuggest,
              search,
            }) => {
              const querySuggestResponsePromise =
                querySuggest.waitForQuerySuggestResponse();
              const searchBoxInput = searchBoxSuggestionsList.searchBoxInput;
              await searchBoxInput.focus();
              await querySuggestResponsePromise;

              const searchAnalyticsPromise =
                searchBoxSuggestionsList.waitForRecentQuerySearchLegacyAnalytics(
                  {
                    queryText: mockRecentQueries[0],
                  }
                );
              const searchRequestPromise = search.waitForSearchRequest();
              // Navigate to the second suggestion using keyboard
              await searchBoxInput.press('ArrowDown');
              await searchBoxInput.press('ArrowDown');
              await searchBoxInput.press('Enter');
              const searchRequestBody = (
                await searchRequestPromise
              ).postDataJSON();
              test.expect(searchRequestBody.q).toBe(mockRecentQueries[0]);
              test
                .expect(searchRequestBody?.analytics?.actionCause)
                .toBe('recentQueriesClick');
              await searchAnalyticsPromise;
            });
          });

          test.describe('when selecting the clear recent queries button', () => {
            test.use({
              recentQueries: mockRecentQueries,
            });
            test('should clear recent queries and send analytics', async ({
              searchBoxSuggestionsList,
              querySuggest,
            }) => {
              const querySuggestResponsePromise =
                querySuggest.waitForQuerySuggestResponse();
              const searchBoxInput = searchBoxSuggestionsList.searchBoxInput;
              await searchBoxInput.focus();
              await querySuggestResponsePromise;

              const clearRecentQueriesAnalyticsPromise =
                searchBoxSuggestionsList.waitForClearRecentQueriesAnalytics({});
              await searchBoxInput.press('ArrowDown');
              await searchBoxInput.press('Enter');
              await clearRecentQueriesAnalyticsPromise;
              const recentQueriesFromLocalStorage =
                await querySuggest.getRecentQueriesFromLocalStorage();
              test.expect(recentQueriesFromLocalStorage).toEqual([]);
            });
          });
        });
      });
    });
  });
});
