import {testSearch, testInsight, expect} from './fixture';
import {
  useCaseEnum,
  useCaseTestCases,
} from '../../../../../../playwright/utils/useCase';

const fixtures = {
  search: testSearch as typeof testSearch,
  insight: testInsight as typeof testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test;
  let sortArrOptions;
  let sortLabelWithValue;
  if (useCase.value === useCaseEnum.search) {
    test = fixtures[useCase.value] as typeof testSearch;
  } else {
    test = fixtures[useCase.value] as typeof testInsight;
  }

  test.describe(`quantic sort ${useCase.label}`, () => {
    test.beforeEach(async ({sort}) => {
      await sort.clickSortDropDown();
      sortArrOptions = await sort.allSortLabelOptions();
      sortLabelWithValue = await sort.getSortLabelValue();
      await sort.clickSortDropDown();
    });

    test.describe(`when changing sort option to 2nd position`, () => {
      test('should trigger a new search and log analytics', async ({
        sort,
        search,
      }) => {
        const {label: expectedSortName, value: expectedSortValue} =
          sortLabelWithValue[1]; // Assuming 0 is the first sort option, 1 should be the 2nd one after that.

        const searchResponsePromise = search.waitForSearchResponse();
        await sort.clickSortDropDown();
        await sort.clickSortButton(expectedSortName);

        const searchResponse = await searchResponsePromise;
        const {sortCriteria} = searchResponse.request().postDataJSON();
        expect(sortCriteria).toBe(expectedSortValue);
        await sort.waitForSortUaAnalytics(expectedSortValue);
      });
    });

    test.describe('when testing accessibility', () => {
      test('should be accessible to keyboard', async ({sort, page}) => {
        let selectedSortLabel = await sort.sortDropDown.textContent();
        expect(selectedSortLabel).toEqual(sortArrOptions[0]);

        // Selecting the next sort using Enter to open dropdown, the ArrowDown, then ENTER key
        await sort.focusSortDropDown();
        await sort.openSortDropdownUsingKeyboardEnter();
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        selectedSortLabel = await sort.sortDropDown.textContent();
        expect(selectedSortLabel).toEqual(sortArrOptions[1]);

        // Selecting the next sort using Space to open dropdown, the ArrowDown, then ENTER key
        await sort.focusSortDropDown();
        await sort.openSortDropdownUsingKeyboardEnter(false);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        selectedSortLabel = await sort.sortDropDown.textContent();
        expect(selectedSortLabel).toEqual(sortArrOptions[2]);
      });
    });

    if (useCase.value === 'search') {
      test.describe('when loading options from the url', () => {
        test('should reflect the options of url in the component', async ({
          sort,
          page,
        }) => {
          const {label: expectedSortName, value: expectedSortValue} =
            sortLabelWithValue[2]; // Assuming 0 is the first sort option

          const currentUrl = await page.url();
          const urlHash = `#sortCriteria=${encodeURI(expectedSortValue)}`;

          await page.goto(`${currentUrl}/${urlHash}`);
          await page.getByRole('button', {name: 'Try it now'}).click();
          await expect(sort.sortDropDown).toContainText(expectedSortName);
        });
      });
    }
  });
});
