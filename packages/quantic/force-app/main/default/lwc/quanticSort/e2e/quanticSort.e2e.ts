import {testSearch, testInsight, expect} from './fixture';
import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';

const newestDateSort = 'date descending';
const viewsDescendingSort = '@ytviewcount descending';
const defaultSortLabels = ['Relevancy', 'Newest', 'Oldest'];

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

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

    test.describe(`when changing custom sort to "Views Descending`, () => {
      test('should trigger a new search and log analytics', async ({
        sortCustom,
        search,
      }) => {
        const searchResponsePromise = search.waitForSearchResponse();
        await sortCustom.clickSortDropDown();
        await sortCustom.clickSortButton('Views Descending');
        const searchResponse = await searchResponsePromise;
        const {sortCriteria} = searchResponse.request().postDataJSON();
        expect(sortCriteria).toBe(viewsDescendingSort);
        await sortCustom.waitForSortUaAnalytics(viewsDescendingSort);
      });
    });

    test.describe(`when the custom option passed has an invalid property`, () => {
      test('should display an error message instead of the quanticSort component', async ({
        sortInvalid,
      }) => {
        await sortInvalid.invalidSortMessage();
      });
    });

    test.describe('when testing accessibility', () => {
      test('should be accessible to keyboard', async ({sort}) => {
        let selectedSortLabel = await sort.sortDropDown.textContent();
        expect(selectedSortLabel).toEqual(defaultSortLabels[0]);

        // Selecting the next sort using the ArrowDown, then ENTER key
        await sort.focusSortDropDownEnter();
        await sort.selectSortButtonKeyboard();
        selectedSortLabel = await sort.sortDropDown.textContent();
        expect(selectedSortLabel).toEqual(defaultSortLabels[1]);

        // Selecting the next sort using the ArrowDown, then ENTER key
        await sort.focusSortDropDownEnter();
        await sort.selectSortButtonKeyboard();
        selectedSortLabel = await sort.sortDropDown.textContent();
        expect(selectedSortLabel).toEqual(defaultSortLabels[2]);
      });
    });
  });
});
