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

const viewportWidths = [
  {
    label: 'extra small',
    width: extraSmallViewportWidth,
    primaryExpectation: 'the selected tab ',
    secondaryExpectation: 'and the more button should be shrunk',
    numberOfTabsDisplayed: 1,
    numberOfOptionsInDropdown: 3,
    moreButtonLabel: '',
  },
  {
    label: 'small',
    width: smallViewportWidth,
    primaryExpectation: 'the selected tab',
    secondaryExpectation: '',
    numberOfTabsDisplayed: 1,
    numberOfOptionsInDropdown: 3,
    moreButtonLabel: 'More',
  },
  {
    label: 'medium',
    width: mediumViewportWidth,
    primaryExpectation: 'the first two tabs',
    secondaryExpectation: '',
    numberOfTabsDisplayed: 2,
    numberOfOptionsInDropdown: 2,
    moreButtonLabel: 'More',
  },
];

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];
  test.describe(`quantic tab bar ${useCase.label}`, () => {
    test.describe("when the container's width can fit all the tabs", () => {
      test('should display all the tabs without displaying the dropdown list', async ({
        tabBar,
      }) => {
        const expectedNumberOfTabs = 4;
        const tabs = tabBar.allVisibleTabs;

        expect(tabs).not.toBeNull();
        expect(await tabs.count()).toEqual(expectedNumberOfTabs);

        const isMoreDropdownVisible = await tabBar.dropdown.isVisible();
        expect(isMoreDropdownVisible).toBe(false);
      });
    });

    viewportWidths.forEach(
      ({
        label,
        width,
        primaryExpectation,
        secondaryExpectation,
        numberOfTabsDisplayed,
        numberOfOptionsInDropdown,
        moreButtonLabel,
      }) => {
        test.describe(`when the viewport is resized to a ${label} width`, () => {
          test.use({
            viewport: {width: width, height: standardViewportHeight},
          });
          test(`should display only ${primaryExpectation}, the other tabs should be displayed in the dropdown list ${secondaryExpectation}`, async ({
            tabBar,
          }) => {
            const displayedTabs = tabBar.allVisibleTabs;

            expect(displayedTabs).not.toBeNull();
            expect(await displayedTabs.count()).toEqual(numberOfTabsDisplayed);

            const isMoreDropdownVisible = await tabBar.dropdown.isVisible();
            expect(isMoreDropdownVisible).toBe(true);

            await tabBar.clickMoreButton();

            const dropdownOptions = tabBar.allDropdownOptions;
            expect(dropdownOptions).not.toBeNull();
            expect(await dropdownOptions.count()).toEqual(
              numberOfOptionsInDropdown
            );

            const dropdownLabel = await tabBar.moreButtonLabel.textContent();
            expect(dropdownLabel).toEqual(moreButtonLabel);
          });
        });
      }
    );

    test.describe('when the more button is clicked', () => {
      // Using medium width (300px), 2 tabs should be displayed and 2 should be in the dropdown.
      test.use({
        viewport: {width: mediumViewportWidth, height: standardViewportHeight},
      });
      test('should open the dropdown and display the options', async ({
        tabBar,
      }) => {
        const expectedNumberOfDropdownOptions = 2;
        await tabBar.clickMoreButton();

        const dropdownOptions = tabBar.allDropdownOptions;
        expect(dropdownOptions).not.toBeNull();
        expect(await dropdownOptions.count()).toEqual(
          expectedNumberOfDropdownOptions
        );
      });

      test.describe('when a tab is selected from the dropdown list', () => {
        test('should correctly select the tab and make it active', async ({
          tabBar,
        }) => {
          const expectedSelectedTabLabel = 'Tab 4';
          const expectedNumberOfDropdownOptions = 2;
          await tabBar.clickMoreButton();

          const dropdownOptionsCount = await tabBar.allDropdownOptions.count();
          expect(dropdownOptionsCount).not.toBeNull();
          expect(dropdownOptionsCount).toEqual(expectedNumberOfDropdownOptions);

          await tabBar.clickDropdownOption(1);

          const activeTab = await tabBar.activeTab.textContent();

          expect(activeTab).not.toBeNull();
          expect(activeTab).toEqual(expectedSelectedTabLabel);
        });

        test('should trigger a new search send the correct UA analytics event', async ({
          tabBar,
          search,
        }) => {
          const expectedActionCause = 'interfaceChange';
          const expectedTabValue = 'Tab 4';
          const expectedOriginContext = 'Search';

          const searchResponsePromise = search.waitForSearchResponse();

          await tabBar.clickMoreButton();
          await tabBar.clickDropdownOption(1);

          const searchResponse = await searchResponsePromise;
          const searchResponseBody = searchResponse.request().postDataJSON();

          expect(searchResponseBody).toEqual(
            expect.objectContaining({
              analytics: expect.objectContaining({
                actionCause: expectedActionCause,
                originContext: expectedOriginContext,
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
      // Using medium width (300px), 2 tabs should be displayed and 2 should be in the dropdown.
      test.use({
        viewport: {width: mediumViewportWidth, height: standardViewportHeight},
      });
      test('should automatically close the dropdown list', async ({tabBar}) => {
        const sldsOpenClass = 'slds-is-open';
        await tabBar.clickMoreButton();

        const dropdownClasses = await tabBar.dropdown.getAttribute('class');
        expect(dropdownClasses).toContain(sldsOpenClass);

        await tabBar.clickComponentContainer();

        const dropdownClassesAfterClose =
          await tabBar.dropdown.getAttribute('class');
        expect(dropdownClassesAfterClose).not.toContain(sldsOpenClass);
      });
    });
  });
});
