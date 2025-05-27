import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';
import {testInsight, testSearch, expect} from './fixture';
import mockData from './data';

const {
  originalQuery: expectedOriginalQuery,
  correctedQuery: expectedCorrectedQuery,
  didYouMeanData,
  didYouMeanNextData,
  queryTriggerData,
  triggeredQuery: expectedTriggeredQuery,
} = mockData;

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

  test.describe(`quantic did you mean ${useCase.label}`, () => {
    test.describe('when we have an automatic did you mean query correction', () => {
      test.describe('with queryCorrectionMode set to "legacy"', () => {
        test.use({
          didYouMeanData,
          options: {
            disableQueryAutoCorrection: false,
            queryCorrectionMode: 'legacy',
          },
        });
        test('should display the didYouMean component and send the analytics', async ({
          didYouMean,
          search,
        }) => {
          await search.mockSearchWithDidYouMeanLegacyResponse(didYouMeanData);
          const automaticallyCorrectSearchPromise =
            search.waitForSearchResponse();
          const expectedUaRequestPromise =
            didYouMean.waitForDidYouMeanAutomaticAnalytics({
              queryText: expectedCorrectedQuery,
            });
          await search.triggerSearchWithInput(expectedOriginalQuery);
          await expectedUaRequestPromise;
          await automaticallyCorrectSearchPromise;

          await expect(didYouMean.didYouMeanNoResultsLabel).toBeVisible();
          await expect(didYouMean.didYouMeanNoResultsLabel).toContainText(
            expectedOriginalQuery
          );
          await expect(
            didYouMean.didYouMeanAutomaticQueryCorrectionLabel
          ).toBeVisible();
          await expect(
            didYouMean.didYouMeanAutomaticQueryCorrectionLabel
          ).toContainText(expectedCorrectedQuery);
        });
      });

      test.describe('with queryCorrectionMode set to "next"', () => {
        test.use({
          didYouMeanData,
          options: {
            disableQueryAutoCorrection: false,
            queryCorrectionMode: 'next',
          },
        });
        test('should display the didYouMean component and send the analytics', async ({
          didYouMean,
          search,
        }) => {
          await search.mockSearchWithDidYouMeanNextResponse(didYouMeanNextData);
          const expectedUaRequestPromise =
            didYouMean.waitForDidYouMeanAutomaticAnalytics({
              queryText: expectedCorrectedQuery,
            });
          await search.triggerSearchWithInput(expectedOriginalQuery);
          await expectedUaRequestPromise;

          await expect(didYouMean.didYouMeanNoResultsLabel).toBeVisible();
          await expect(didYouMean.didYouMeanNoResultsLabel).toContainText(
            expectedOriginalQuery
          );
          await expect(
            didYouMean.didYouMeanAutomaticQueryCorrectionLabel
          ).toBeVisible();
          await expect(
            didYouMean.didYouMeanAutomaticQueryCorrectionLabel
          ).toContainText(expectedCorrectedQuery);
        });
      });
    });

    test.describe("when we don't have an automatic did you mean query correction", () => {
      test.describe('with queryCorrectionMode set to "legacy"', () => {
        test.use({
          didYouMeanData,
          options: {
            disableQueryAutoCorrection: true,
            queryCorrectionMode: 'legacy',
          },
        });
        test('should display the didYouMean component but not correct the query', async ({
          didYouMean,
          search,
        }) => {
          await search.mockSearchWithDidYouMeanLegacyResponse(didYouMeanData);
          await search.triggerSearchWithInput(expectedOriginalQuery);

          await expect(
            didYouMean.didYouMeanManualCorrectionLabel
          ).toBeVisible();
          await expect(didYouMean.applyCorrectionButton).toBeVisible();
          await expect(didYouMean.applyCorrectionButton).toContainText(
            expectedCorrectedQuery
          );

          const correctedSearchResponsePromise = search.waitForSearchResponse();
          const correctedUAReponsePromise =
            didYouMean.waitForDidYouMeanManualAnalytics({
              queryText: expectedCorrectedQuery,
            });
          didYouMean.applyCorrection();
          await correctedUAReponsePromise;
          const searchResponse = await correctedSearchResponsePromise;
          const correctedSearchBody = searchResponse
            .request()
            ?.postDataJSON?.();
          expect(correctedSearchBody?.q).toEqual(expectedCorrectedQuery);
        });
      });

      test.describe('with queryCorrectionMode set to "next"', () => {
        test.use({
          didYouMeanData,
          options: {
            disableQueryAutoCorrection: true,
            queryCorrectionMode: 'next',
          },
        });
        test('should display the didYouMean component and send the analytics', async ({
          didYouMean,
          search,
        }) => {
          await search.mockSearchWithDidYouMeanNextResponse(didYouMeanNextData);
          await search.triggerSearchWithInput(expectedOriginalQuery);

          await expect(
            didYouMean.didYouMeanManualCorrectionLabel
          ).toBeVisible();
          await expect(didYouMean.applyCorrectionButton).toBeVisible();
          await expect(didYouMean.applyCorrectionButton).toContainText(
            expectedCorrectedQuery
          );

          const correctedSearchResponsePromise = search.waitForSearchResponse();
          const correctedUAReponsePromise =
            didYouMean.waitForDidYouMeanManualAnalytics({
              queryText: expectedCorrectedQuery,
            });
          didYouMean.applyCorrection();
          await correctedUAReponsePromise;
          const searchResponse = await correctedSearchResponsePromise;
          const correctedSearchBody = searchResponse
            .request()
            ?.postDataJSON?.();
          expect(correctedSearchBody?.q).toEqual(expectedCorrectedQuery);
        });
      });
    });

    if (useCase.value === 'search') {
      test.describe('when we have a query trigger response', () => {
        test.use({
          queryTriggerData,
        });

        test('should search with the triggered query instead of the original query', async ({
          didYouMean,
          search,
        }) => {
          await search.mockSearchWithQueryTriggerResponse(queryTriggerData);
          await search.triggerSearchWithInput(expectedOriginalQuery);

          await expect(didYouMean.showingResultsForLabel).toBeVisible();
          await expect(didYouMean.showingResultsForLabel).toContainText(
            expectedTriggeredQuery
          );
          await expect(didYouMean.undoButton).toBeVisible();
          await expect(didYouMean.undoButton).toContainText(
            expectedOriginalQuery
          );
        });

        test('when pressing the undo button should send the correct analytics and reset the query', async ({
          didYouMean,
          search,
        }) => {
          await search.mockSearchWithQueryTriggerResponse(queryTriggerData);

          const queryTriggerCustomUAPromise =
            didYouMean.waitForQueryTriggerCustomAnalytics({});
          await search.triggerSearchWithInput(expectedOriginalQuery);
          await queryTriggerCustomUAPromise;

          const undoSearchResponsePromise = search.waitForSearchResponse();
          const undoUASearchEvent = didYouMean.waitForUndoQueryAnalytics({
            queryText: expectedOriginalQuery,
          });
          didYouMean.undo();
          await undoUASearchEvent;
          const searchResponse = await undoSearchResponsePromise;
          const searchBody = searchResponse.request()?.postDataJSON?.();
          expect(searchBody?.q).toEqual(expectedOriginalQuery);
        });
      });
    }
  });
});
