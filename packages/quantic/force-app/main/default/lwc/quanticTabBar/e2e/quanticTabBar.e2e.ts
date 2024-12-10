import {testSearch, testInsight, expect} from './fixture';
import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

const viewportWidths = [
  {
    label: 'extra small',
    width: 200,
    primaryExpectation: 'the selected tab ',
    secondaryExpectation: 'and the more button should be shrunk',
    numberOfTabsDisplayed: 1,
    numberOfOptionsInDropdown: 3,
  },
  {
    label: 'small',
    width: 260,
    primaryExpectation: 'the selected tab',
    secondaryExpectation: '',
    numberOfTabsDisplayed: 1,
    numberOfOptionsInDropdown: 3,
  },
  {
    label: 'medium',
    width: 300,
    primaryExpectation: 'the first two tabs',
    secondaryExpectation: '',
    numberOfTabsDisplayed: 2,
    numberOfOptionsInDropdown: 2,
  },
];

const standardViewportHeight = 1080;

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];
  test.describe(`quantic tab bar ${useCase.label}`, () => {
    test.describe("when the container's width can fit all the tabs", () => {
      test('should display all the tabs without displaying the dropdown list', async ({
        tabBar,
      }) => {
        const tabs = tabBar.allVisibleTabs;

        expect(tabs).not.toBeNull();
        expect(await tabs.count()).toEqual(4);

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
          });
        });
      }
    );

    test.describe('when the more button is clicked', () => {
      // Here on medium width (300px), 2 tabs should be displayed and 2 should be in the dropdown.
      test.use({
        viewport: {width: 300, height: standardViewportHeight},
      });
      test('should open the dropdown and display the options', async ({
        tabBar,
      }) => {
        await tabBar.clickMoreButton();

        const dropdownOptions = tabBar.allDropdownOptions;
        expect(dropdownOptions).not.toBeNull();
        expect(await dropdownOptions.count()).toEqual(2);
      });

      test.describe('when a tab is selected from the dropdown list', () => {
        test('should correctly select the tab and make it active', async ({
          tabBar,
        }) => {
          const expectedSelectedTabLabel = 'Tab 4';
          await tabBar.clickMoreButton();

          const dropdownOptionsCount = await tabBar.allDropdownOptions.count();
          expect(dropdownOptionsCount).not.toBeNull();
          expect(dropdownOptionsCount).toEqual(2);

          await tabBar.clickDropdownOption(1);

          const activeTab = await tabBar.activeTab.textContent();

          expect(activeTab).not.toBeNull();
          expect(activeTab).toEqual(expectedSelectedTabLabel);
        });
      });
    });

    test.describe('when the dropdown loses focus', () => {
      // Here on medium width (300px), 2 tabs should be displayed and 2 should be in the dropdown.
      test.use({
        viewport: {width: 300, height: standardViewportHeight},
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
