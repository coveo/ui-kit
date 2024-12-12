import {testSearch, testInsight, expect} from './fixture';
import {
  useCaseEnum,
  useCaseTestCases,
} from '../../../../../../playwright/utils/useCase';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

const expectedActionCause = 'interfaceChange';
const expectedOriginContext = 'Search';
const expectedTabsLabels = ['All', 'Case', 'Knowledge'];

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

  test.describe(`quantic tab ${useCase.label}`, () => {
    test.describe('when clicking on a tab', () => {
      test('should trigger a new search and send the correct UA analytics event', async ({
        tab,
        search,
      }) => {
        const selectedTabIndex = 0;
        const searchResponsePromise = search.waitForSearchResponse();
        const uaRequestPromise = tab.waitForTabSelectUaAnalytics();
        await tab.clickTabButton(selectedTabIndex);

        const searchResponse = await searchResponsePromise;
        const {analytics} = searchResponse.request().postDataJSON();
        expect(analytics.actionCause).toEqual(expectedActionCause);
        expect(analytics.originContext).toEqual(expectedOriginContext);

        const analyticsResponse = await uaRequestPromise;
        const {customData} = analyticsResponse.postDataJSON();
        expect(customData.interfaceChangeTo).toEqual(
          expectedTabsLabels[selectedTabIndex]
        );
      });
    });

    if (useCase.value === useCaseEnum.search) {
      test.describe('when loading selected tab from URL', () => {
        test.use({
          urlHash: 'tab=Knowledge',
        });
        test('should make the right tab active', async ({tab}) => {
          const desiredTabLabel = expectedTabsLabels[2];
          expect(await tab.activeTabLabel.textContent()).toBe(desiredTabLabel);
        });
      });
    }

    test.describe('when testing accessibility', () => {
      test('should be accessible to keyboard', async ({tab}) => {
        await tab.clickTabButton(0);

        let activeTabLabel = await tab.activeTabLabel.textContent();
        expect(activeTabLabel).toEqual(expectedTabsLabels[0]);

        await tab.pressTabThenEnter();
        activeTabLabel = await tab.activeTabLabel.textContent();
        expect(activeTabLabel).toEqual(expectedTabsLabels[1]);

        await tab.pressShiftTabThenSpace();
        activeTabLabel = await tab.activeTabLabel.textContent();
        expect(activeTabLabel).toEqual(expectedTabsLabels[0]);
      });
    });
  });
});
