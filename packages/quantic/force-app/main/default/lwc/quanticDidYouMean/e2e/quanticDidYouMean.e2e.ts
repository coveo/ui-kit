import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';
import {testInsight, testSearch, expect} from './fixture';
import mockData from './data';

const {didYouMeanData} = mockData;

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

  test.describe(`quantic did you mean ${useCase.label}`, () => {
    test.describe('when the search returns a didYouMean response', () => {
      test.use({
        didYouMeanData,
      });
      test('should display the didYouMean component', async ({
        didYouMean,
        search,
      }) => {
        // const expectedCorrectedQuery = mockData.didYouMeanData.correctedQuery;
        const expectedOriginalQuery =
          mockData.didYouMeanData.wordCorrections[0].originalWord;
        // expect(expectedCorrectedQuery).not.toBe(expectedOriginalQuery);
        const searchResponsePromise = search.waitForSearchResponse();
        await search.mockSearchWithDidYouMeanResponse(mockData.didYouMeanData);
        didYouMean.setQuery(expectedOriginalQuery);
        didYouMean.performSearch();
        await searchResponsePromise;
        // console.log('response', await searchResponse.json());
        expect(didYouMean.didYouMeanNoResultsLabel).toBeVisible();
      });
    });
  });
});
