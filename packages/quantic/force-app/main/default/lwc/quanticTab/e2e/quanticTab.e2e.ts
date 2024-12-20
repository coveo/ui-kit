import {testSearch, testInsight, expect} from './fixture';
import {
  useCaseEnum,
  useCaseTestCases,
} from '../../../../../../playwright/utils/useCase';

const fixtures = {
  search: testSearch as typeof testSearch,
  insight: testInsight as typeof testInsight,
};

const expectedActionCause = 'interfaceChange';
const exampleTabs = ['All', 'Case', 'Knowledge'];

useCaseTestCases.forEach((useCase) => {
  let test;
  if (useCase.value === useCaseEnum.search) {
    test = fixtures[useCase.value] as typeof testSearch;
  } else {
    test = fixtures[useCase.value] as typeof testInsight;
  }

  test.describe(`quantic tab ${useCase.label}`, () => {
    test.describe('when clicking on a tab', () => {
      test('should trigger a new search and send the correct UA analytics event', async ({
        tab,
        search,
      }) => {
        const selectedTabIndex = 0;
        const searchResponsePromise = search.waitForSearchResponse();
        const uaRequestPromise = tab.waitForTabSelectUaAnalytics({
          interfaceChangeTo: exampleTabs[selectedTabIndex],
        });
        await tab.clickTabButton(exampleTabs[selectedTabIndex]);

        const searchResponse = await searchResponsePromise;
        await uaRequestPromise;

        const actionCause =
          tab.extractActionCauseFromSearchResponse(searchResponse);
        expect(actionCause).toEqual(expectedActionCause);
      });
    });

    if (useCase.value === useCaseEnum.search) {
      test.describe('when loading selected tab from URL', () => {
        const expectedTab = exampleTabs[2];
        test.use({
          urlHash: `tab=${expectedTab}`,
        });

        test('should make the right tab active', async ({tab}) => {
          expect(await tab.activeTabLabel).toBe(expectedTab);
        });
      });
    }

    test.describe('when testing accessibility', () => {
      test('should be accessible to keyboard', async ({tab}) => {
        await tab.clickTabButton(exampleTabs[0]);

        let activeTabLabel = await tab.activeTabLabel;
        expect(activeTabLabel).toEqual(exampleTabs[0]);

        await tab.pressTabThenEnter();
        activeTabLabel = await tab.activeTabLabel;
        expect(activeTabLabel).toEqual(exampleTabs[1]);

        await tab.pressShiftTabThenSpace();
        activeTabLabel = await tab.activeTabLabel;
        expect(activeTabLabel).toEqual(exampleTabs[0]);
      });
    });
  });
});
