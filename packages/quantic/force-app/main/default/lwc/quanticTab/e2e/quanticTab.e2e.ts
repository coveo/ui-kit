import {testSearch, testInsight, expect} from './fixture';
import {
  useCaseEnum,
  useCaseTestCases,
} from '../../../../../../playwright/utils/useCase';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

const tabs = {
  all: {
    label: 'All',
    expression: undefined,
  },
  case: {
    label: 'Case',
    expression: '@objecttype==Case',
  },
  knowledge: {
    label: 'Knowledge',
    expression: '@objecttype==Knowledge',
  },
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

  test.describe(`quantic tab ${useCase.label}`, () => {
    test('should not show tabs before the initial search completes', async ({
      tab,
      search,
    }) => {
      await expect(tab).not.toBeVisible();
      const searchResponsePromise = search.waitForSearchResponse();
      const searchResponse = await searchResponsePromise;
      const searchResponseBody = searchResponse.request().postDataJSON();
      console.log('searchResponseBody', JSON.stringify(searchResponseBody));
      await expect(tab).toBeVisible();
    });

    test.describe('when clicking a tab', () => {
      test('should trigger a new search and log analytics', async ({
        tab,
        search,
      }) => {
        const expectedSearchResponseBody = {};
        const searchResponsePromise = search.waitForSearchResponse();
        await tab.clickTab(tabs.knowledge.label);
        const searchResponse = await searchResponsePromise;
        const searchResponseBody = searchResponse.request().postDataJSON();
        console.log('searchResponseBody', JSON.stringify(searchResponseBody));
        expect(searchResponseBody).toBe(expectedSearchResponseBody);
        await tab.waitForPagerNextUaAnalytics();
      });
    });

    if (useCase.value === useCaseEnum.search) {
      test.describe('when loading selected tab from URL', () => {
        test('should make the right tab active', async ({tab}) => {
          // TODO: Implement the test
          console.log(tab);
        });
      });
    }

    test.describe('when testing accessibility', () => {
      test('should be accessible to keyboard', async ({tab}) => {
        // TODO: Implement the test
        console.log(tab);
      });
    });
  });
});
