import {testSearch, testInsight, expect} from './fixture';
import {
  AnalyticsModeEnum,
  analyticsModeTest,
} from '../../../../../../playwright/utils/analyticsMode';
import {
  useCaseTestCases,
  useCaseEnum,
} from '../../../../../../playwright/utils/useCase';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];
  test.describe(`quantic search box ${useCase.label}`, () => {
    analyticsModeTest.forEach((analytics) => {
      test.describe(analytics.label, () => {
        test.use({
          analyticsMode: analytics.mode,
        });

        test.describe('something', () => {
          test('should do something', async ({searchBox, search}) => {});
        });
      });
    });
  });
})