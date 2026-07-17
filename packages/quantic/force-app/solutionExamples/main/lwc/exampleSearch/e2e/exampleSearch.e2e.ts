import {testSearch, expect} from './fixture';

let test = testSearch;
let consoleErrors: string[] = [];

test.describe('Example Search Page E2E Tests', () => {
  test.beforeEach(async ({page}) => {
    consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
  });

  test.describe('when loading the search page', () => {
    test('should render correctly and load results automatically', async ({
      searchPage,
    }) => {
      await expect(searchPage.errorComponent).not.toBeVisible();
      expect(consoleErrors.length).toBe(0);
      expect(searchPage.searchbox).toBeVisible();
      expect(searchPage.facetsManager).toBeVisible();
      expect(searchPage.facets).toBeVisible();
      expect(searchPage.summary).toBeVisible();
      expect(searchPage.sort).toBeVisible();
      expect(searchPage.tabBar).toBeVisible();
      expect(searchPage.pager).toBeVisible();
      expect(searchPage.foldedResultList).toBeVisible();
      expect(searchPage.recentQueriesList).toBeVisible();
      expect(searchPage.recentResultsList).toBeVisible();

      const firstResult = searchPage.results.first();
      expect(await firstResult.textContent()).not.toBeNull();

      const resultsCount = searchPage.results.count();
      expect(await resultsCount).toBeGreaterThan(0);
    });
  });

  test.describe('the happy path', () => {
    test('should allow the user to search, sort, change the result page, change the tab, select a facet and clear filters', async ({
      searchPage,
      search,
    }) => {
      await expect(searchPage.errorComponent).not.toBeVisible();

      const exampleQuery = 'knowledge';

      await test.step('trigger a search query', async () => {
        const searchRequestPromise = search.waitForSearchRequest();

        await searchPage.searchboxInput.fill(exampleQuery);
        await searchPage.searchboxInput.press('Enter');

        await searchRequestPromise;
        const searchRequestBody = (await searchRequestPromise).postDataJSON();
        expect(searchRequestBody?.q).toBe(exampleQuery);

        await expect(searchPage.summary).toContainText(exampleQuery);

        const recentQueriesListItems =
          await searchPage.recentQueriesListItems.allInnerTexts();
        expect(recentQueriesListItems.length).toEqual(1);
        expect(recentQueriesListItems[0]).toBe(exampleQuery);
      });

      await test.step('change the sort order', async () => {
        const sortClickSearchRequestPromise = search.waitForSearchRequest();
        await searchPage.sortDropdownButton.click();
        const sortLabelWithValue = await searchPage.getSortLabelValue();
        const {label: expectedSortName, value: expectedSortValue} =
          sortLabelWithValue[1];

        await searchPage.clickSortButton(expectedSortName);
        const searchRequestBodyAfterSortClick = (
          await sortClickSearchRequestPromise
        ).postDataJSON();
        expect(searchRequestBodyAfterSortClick?.sortCriteria).toBe(
          expectedSortValue
        );
      });

      await test.step('change the result page', async () => {
        const pagerClickSearchRequestPromise = search.waitForSearchRequest();
        await searchPage.clickOnPagerButtonByIndex(2);
        const searchRequestBodyAfterPagerClick = (
          await pagerClickSearchRequestPromise
        ).postDataJSON();
        expect(searchRequestBodyAfterPagerClick?.firstResult).toBe(10);
      });

      await test.step('change the tab', async () => {
        const secondTab = await searchPage.getTabByIndex(1);
        const expectedTabName = await secondTab.textContent();
        const tabClickSearchRequestPromise = search.waitForSearchRequest();
        await secondTab.click();
        await tabClickSearchRequestPromise;
        const searchRequestBodyAfterTabClick = (
          await tabClickSearchRequestPromise
        ).postDataJSON();
        expect(searchRequestBodyAfterTabClick?.tab).toBe(expectedTabName);
        await search.waitForSearchResponse();
      });

      await test.step('select a facet value', async () => {
        const facetSelectSearchRequestPromise = search.waitForSearchRequest();
        const firstFacetValue = await searchPage.getFacetValueByIndex(0);
        await firstFacetValue.click();

        expect(firstFacetValue).not.toBeNull();
        const searchRequestBodyAfterFacetSelect = (
          await facetSelectSearchRequestPromise
        ).postDataJSON();

        const selectedFacet =
          searchRequestBodyAfterFacetSelect?.facets?.[0]?.currentValues.find(
            (facet: any) => facet.state === 'selected'
          );
        const cleanedFirstFacetValue = (
          await firstFacetValue.textContent()
        )?.replace('Facet value option', '');
        expect(cleanedFirstFacetValue).toContain(selectedFacet?.value);
      });

      await test.step('clear the filters', async () => {
        const clearFiltersSearchRequestPromise = search.waitForSearchRequest();
        await searchPage.clearFiltersButton.click();
        const searchRequestBodyAfterClearFilters = (
          await clearFiltersSearchRequestPromise
        ).postDataJSON();

        const facetsFromRequest = searchRequestBodyAfterClearFilters?.facets;
        facetsFromRequest.forEach(
          (facet: {currentValues: Array<{state: string}>}) => {
            facet.currentValues.forEach((value: {state: string}) => {
              expect(value.state).toBe('idle');
            });
          }
        );
      });
    });
  });

  test.describe('when narrowing the width of the screen', () => {
    test('should hide the sort and facet components and display the refine toggle component', async ({
      searchPage,
    }) => {
      await expect(searchPage.sort).toBeVisible();
      await expect(searchPage.facetsManager).toBeVisible();
      await expect(searchPage.facets).toBeVisible();
      await expect(searchPage.refineToggle).not.toBeVisible();

      await searchPage.page.setViewportSize({width: 500, height: 800});
      await expect(searchPage.refineToggle).toBeVisible();

      await expect(searchPage.sort).not.toBeVisible();
      await expect(searchPage.facetsManager).not.toBeVisible();
      await expect(searchPage.facets).not.toBeVisible();
    });
  });
});
