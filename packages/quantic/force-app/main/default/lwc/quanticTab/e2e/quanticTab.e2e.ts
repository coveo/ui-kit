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
    test.skip('should not show tabs before the initial search completes', async ({
      tab,
      search,
    }) => {
      const searchResponsePromise = search.waitForSearchResponse();
      const searchResponse = await searchResponsePromise;
      const searchResponseBody = searchResponse.request().postDataJSON();
      console.log('searchResponseBody: ', JSON.stringify(searchResponseBody));
      // TODO: Implement test logic
      expect(tab.tab).toBeDefined();
    });

    test.describe('when clicking on a tab', () => {
      test('should trigger a new search and log analytics', async ({
        tab,
        search,
      }) => {
        const selectedTabIndex = 0;
        const searchResponsePromise = search.waitForSearchResponse();
        const uaRequestPromise = tab.waitForTabSelectUaAnalytics();
        await tab.clickTabButton(selectedTabIndex);

        const searchResponse = await searchResponsePromise;
        const searchResponseBody = searchResponse.request().postDataJSON();

        expect(searchResponseBody).toEqual(
          expect.objectContaining({
            analytics: expect.objectContaining({
              actionCause: expectedActionCause,
              originContext: expectedOriginContext,
            }),
            tab: await tab.tabLabel(selectedTabIndex),
          })
        );

        const uaRequest = await uaRequestPromise;
        const uaRequestBody = uaRequest.postDataJSON();

        expect(uaRequestBody).toEqual(
          expect.objectContaining({
            actionCause: expectedActionCause,
            originContext: expectedOriginContext,
            customData: expect.objectContaining({
              interfaceChangeTo: await tab.tabLabel(selectedTabIndex),
            }),
          })
        );
      });
    });

    if (useCase.value === useCaseEnum.search) {
      test.describe('when loading selected tab from URL', () => {
        test('should make the right tab active', async ({tab}) => {
          const desiredTabIndex = 1;
          const desiredTabLabel = await tab.tabLabel(desiredTabIndex);
          await tab.page.goto(tab.page.url() + `#tab=${desiredTabLabel}`);

          expect(await tab.activeTabLabel.textContent()).toBe(desiredTabLabel);
        });
      });
    }

    test.describe('when testing accessibility', () => {
      test('should be accessible to keyboard', async ({tab}) => {
        // Selecting the first tab
        await tab.clickTabButton(0);

        let activeTabLabel = await tab.activeTabLabel.textContent();
        expect(activeTabLabel).toEqual(expectedTabsLabels[0]);

        // Selecting the next tab using the TAB, then ENTER key
        await tab.pressTabThenEnter();
        activeTabLabel = await tab.activeTabLabel.textContent();
        expect(activeTabLabel).toEqual(expectedTabsLabels[1]);

        // Selecting the previous tab using the SHIFT + TAB, then SPACE key
        await tab.pressShiftTabThenSpace();
        activeTabLabel = await tab.activeTabLabel.textContent();
        expect(activeTabLabel).toEqual(expectedTabsLabels[0]);
      });
    });
  });
});
