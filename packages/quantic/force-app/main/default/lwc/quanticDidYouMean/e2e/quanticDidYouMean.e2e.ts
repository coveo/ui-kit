import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';
import {testInsight, testSearch, expect} from './fixture';
import mockData from './data';

const {didYouMeanData} = mockData;
const expectedCorrectedQuery = didYouMeanData.correctedQuery;
const expectedOriginalQuery = didYouMeanData.wordCorrections[0].originalWord;

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

  test.describe(`quantic did you mean ${useCase.label}`, () => {
    test.describe('when we have an automatic did you mean query correction', () => {
      test.use({
        didYouMeanData,
      });
      test('should display the didYouMean component and send the analytics', async ({
        didYouMean,
        search,
      }) => {
        await search.mockSearchWithDidYouMeanResponse(mockData.didYouMeanData);
        const searchResponsePromise = search.waitForSearchResponse();
        const expectedUaRequestPromise =
          didYouMean.waitForDidYouMeanAutomaticAnalytics({
            queryText: expectedCorrectedQuery,
          });
        didYouMean.setQuery(expectedOriginalQuery);
        didYouMean.performSearch();
        await searchResponsePromise;
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
});
