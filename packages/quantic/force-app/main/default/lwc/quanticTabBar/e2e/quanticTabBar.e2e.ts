import {testSearch, testInsight, expect} from './fixture';
import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

const extraSmallViewportWidth = 200;
const smallViewportWidth = 260;
const mediumViewportWidth = 300;
const standardViewportHeight = 1080;
const expectedNumberOfTabs = 4;

const viewportTests = [
  {
    testDescribe: 'when the viewport is resized to a extra small width',
    viewportWidth: extraSmallViewportWidth,
    testLabel:
      'should display only the selected tab and the more button without a label, the other tabs are in the dropdown',
    expectedNumberOfTabsDisplayed: 1,
    expectedMoreButtonLabel: '',
  },
  {
    testDescribe: 'when the viewport is resized to a small width',
    viewportWidth: smallViewportWidth,
    testLabel:
      'should display only the selected tab and the more button with a label, the other tabs are in the dropdown',
    expectedNumberOfTabsDisplayed: 1,
    expectedMoreButtonLabel: 'More',
  },
  {
    testDescribe: 'when the viewport is resized to a medium width',
    viewportWidth: mediumViewportWidth,
    testLabel:
      'should display only the first two tabs and the more button with a label, the other tabs are in the dropdown',
    expectedNumberOfTabsDisplayed: 2,
    expectedMoreButtonLabel: 'More',
  },
];

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];
  test.describe(`quantic tab bar ${useCase.label}`, () => {
    test.describe("when the container's width can fit all the tabs", () => {
      test('should display all the tabs without displaying the dropdown list', async ({
        tabBar,
      }) => {
        const tabBarElement = tabBar.tabBar;
        await tabBarElement.scrollIntoViewIfNeeded();
        const tabs = tabBar.allTabs;
        expect(tabs).not.toBeNull();
        expect(await tabs.count()).toEqual(expectedNumberOfTabs);

        const isMoreDropdownVisible =
          await tabBar.dropdownContainer.isVisible();
        expect(isMoreDropdownVisible).toBe(false);
      });
    });

    // Test different behaviors based on the viewport width.
    viewportTests.forEach(
      ({
        testDescribe,
        viewportWidth,
        testLabel,
        expectedNumberOfTabsDisplayed,
        expectedMoreButtonLabel,
      }) => {
        test.describe(testDescribe, () => {
          test.use({
            viewport: {width: viewportWidth, height: standardViewportHeight},
          });
          test(testLabel, async ({tabBar}) => {
            const dropdownContainer = tabBar.dropdownContainer;
            await dropdownContainer.scrollIntoViewIfNeeded();

            const displayedTabs = tabBar.allVisibleTabs;
            expect(displayedTabs).not.toBeNull();
            expect(await displayedTabs.count()).toEqual(
              expectedNumberOfTabsDisplayed
            );

            expect(await dropdownContainer.isVisible()).toBe(true);

            await tabBar.clickMoreButton();

            const tabsInDropdown = tabBar.allDropdownOptions;
            expect(tabsInDropdown).not.toBeNull();
            expect(await tabsInDropdown.count()).toEqual(
              expectedNumberOfTabs - expectedNumberOfTabsDisplayed
            );

            expect(await tabBar.moreButton.textContent()).toEqual(
              expectedMoreButtonLabel
            );
          });
        });
      }
    );

    test.describe('when the more button is clicked', () => {
      // Using medium width (300px), 2 tabs should be displayed and 2 should be in the dropdown.
      test.use({
        viewport: {width: mediumViewportWidth, height: standardViewportHeight},
      });

      test.describe('when a tab is selected from the dropdown list', () => {
        test('should make the tab active, trigger a new search and send the correct analytics event', async ({
          tabBar,
          search,
        }) => {
          const expectedSelectedTabLabel = 'Tab 4';
          const expectedNumberOfDropdownOptions = 2;
          const expectedActionCause = 'interfaceChange';
          const expectedTabValue = 'Tab 4';

          const searchResponsePromise = search.waitForSearchResponse();

          await tabBar.clickMoreButton();
          const dropdownOptionsCount = await tabBar.allDropdownOptions.count();
          expect(dropdownOptionsCount).not.toBeNull();
          expect(dropdownOptionsCount).toEqual(expectedNumberOfDropdownOptions);
          await tabBar.clickDropdownOption(1);

          const activeTab = await tabBar.activeTab.textContent();

          expect(activeTab).not.toBeNull();
          expect(activeTab).toEqual(expectedSelectedTabLabel);

          const searchResponse = await searchResponsePromise;
          const searchResponseBody = searchResponse.request().postDataJSON();

          expect(searchResponseBody).toEqual(
            expect.objectContaining({
              analytics: expect.objectContaining({
                actionCause: expectedActionCause,
              }),
              tab: expectedTabValue,
            })
          );

          const uaRequest =
            await tabBar.waitForDropdownOptionSelectUaAnalytics();
          const requestBody = uaRequest.postDataJSON?.();

          expect(requestBody).not.toBeNull();
          expect(requestBody.actionCause).toEqual(expectedActionCause);
          expect(requestBody.customData.interfaceChangeTo).toEqual(
            expectedTabValue
          );
        });
      });
    });

    test.describe('when the dropdown loses focus', () => {
      test.use({
        viewport: {width: mediumViewportWidth, height: standardViewportHeight},
      });
      test('should automatically close the dropdown list', async ({tabBar}) => {
        await tabBar.clickMoreButton();

        expect(await tabBar.tabBarDropdown.isVisible()).toBe(true);

        await tabBar.clickComponentContainer();

        expect(await tabBar.tabBarDropdown.isVisible()).toBe(false);
      });
    });
  });
});
