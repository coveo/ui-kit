import {testSearch, testInsight} from './fixture';
import {
  useCaseEnum,
  useCaseTestCases,
} from '../../../../../../playwright/utils/useCase';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

const defaultChoices = [10, 25, 50, 100];
const defaultInitialChoice = 10;

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

  test.describe(`quantic results per page ${useCase.label}`, () => {
    test.describe('with default options', () => {
      test('should load as expected', async ({resultsPerPage}) => {
        await test.expect(resultsPerPage.component).toBeVisible();
        test
          .expect(await resultsPerPage.allResultsPerPageOptionsButtons.count())
          .toBe(defaultChoices.length);
        test
          .expect(resultsPerPage.selectedResultsPerPageOption)
          .toHaveText(defaultInitialChoice.toString());
      });

      test.describe('when selecting a new results per page option', () => {
        test('should trigger a new search and log analytics', async ({
          resultsPerPage,
          search,
        }) => {
          const newChoice = 25;

          const searchResponsePromise = search.waitForSearchResponse();
          const resultsPerPageAnalyticsPromise =
            resultsPerPage.waitForResultsPerPageUA({
              currentResultsPerPage: newChoice,
            });

          await resultsPerPage.clickResultsPerPageOptionByValue(newChoice);

          const searchResponse = await searchResponsePromise;
          await resultsPerPageAnalyticsPromise;

          test
            .expect(resultsPerPage.selectedResultsPerPageOption)
            .toHaveText(newChoice.toString());
          test
            .expect(searchResponse.request().postDataJSON()?.numberOfResults)
            .toBe(newChoice);
        });
      });
    });

    test.describe('with custom options', () => {
      const customChoices = [20, 40, 80];
      test.use({
        options: {
          choicesDisplayed: customChoices.join(','),
        },
      });

      test('should load as expected', async ({resultsPerPage}) => {
        await test.expect(resultsPerPage.component).toBeVisible();
        test
          .expect(await resultsPerPage.allResultsPerPageOptionsButtons.count())
          .toBe(customChoices.length);
      });
    });

    if (useCase.value === useCaseEnum.search) {
      test.describe('when loading from URL hash', () => {
        const expectedResultsPerPage = 50;
        test.use({
          urlHash: `numberOfResults=${expectedResultsPerPage}`,
        });

        test('should load the right number of results per page', async ({
          resultsPerPage,
        }) => {
          await test.expect(resultsPerPage.component).toBeVisible();
          test
            .expect(
              await resultsPerPage.allResultsPerPageOptionsButtons.count()
            )
            .toBe(defaultChoices.length);
          test
            .expect(resultsPerPage.selectedResultsPerPageOption)
            .toHaveText(expectedResultsPerPage.toString());
        });
      });
    }
  });
});
