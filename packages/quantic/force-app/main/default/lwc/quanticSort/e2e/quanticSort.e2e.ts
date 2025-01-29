import {testSearch, testInsight, expect} from './fixture';
import {
  useCaseEnum,
  useCaseTestCases,
} from '../../../../../../playwright/utils/useCase';

const newestDateSort = 'date descending';
const defaultSortLabels = ['Relevancy', 'Newest', 'Oldest'];

const fixtures = {
  search: testSearch as typeof testSearch,
  insight: testInsight as typeof testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test;
  if (useCase.value === useCaseEnum.search) {
    test = fixtures[useCase.value] as typeof testSearch;
  } else {
    test = fixtures[useCase.value] as typeof testInsight;
  }

  test.describe(`quantic sort  ${useCase.label}`, () => {
    test.describe(`when changing sort option to Newest`, () => {
      test('should trigger a new search and log analytics', async ({
        sort,
        search,
      }) => {
        const searchResponsePromise = search.waitForSearchResponse();
        await sort.clickSortDropDown();
        await sort.clickSortButton('Newest');
        const searchResponse = await searchResponsePromise;
        const {sortCriteria} = searchResponse.request().postDataJSON();
        expect(sortCriteria).toBe(newestDateSort);
        await sort.waitForSortUaAnalytics(newestDateSort);
      });
    });

    test.describe('when testing accessibility', () => {
      test('should be accessible to keyboard', async ({sort, page}) => {
        let selectedSortLabel = await sort.sortDropDown.textContent();
        expect(selectedSortLabel).toEqual(defaultSortLabels[0]);

        // Selecting the next sort using Enter to open dropdown, the ArrowDown, then ENTER key
        await sort.focusSortDropDown();
        await sort.openSortDropdownUsingKeyboardEnter();
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        selectedSortLabel = await sort.sortDropDown.textContent();
        expect(selectedSortLabel).toEqual(defaultSortLabels[1]);

        // Selecting the next sort using Space to open dropdown, the ArrowDown, then ENTER key
        await sort.focusSortDropDown();
        await sort.openSortDropdownUsingKeyboardEnter(false);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        selectedSortLabel = await sort.sortDropDown.textContent();
        expect(selectedSortLabel).toEqual(defaultSortLabels[2]);
      });
    });

    if (useCase.value === 'search') {
      test.describe('when loading options from the url', () => {
        test.use({
          urlHash: 'sortCriteria=date%20ascending',
        });

        test('should reflect the options of url in the component', async ({
          sort,
        }) => {
          const expectedSort = 'Oldest';
          await expect(sort.sortDropDown).toContainText(expectedSort);
        });
      });
    }
  });
});
