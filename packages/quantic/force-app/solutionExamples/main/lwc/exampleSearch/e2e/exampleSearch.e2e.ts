import {testSearch, expect} from './fixture';

let test = testSearch;

test.describe('Example Search Page E2E Tests', () => {
  test.describe('when loading the search page', () => {
    test('should render correctly and load results automatically', async ({
      searchPage,
    }) => {
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
      expect(firstResult).toBeVisible();
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
      // Trigger a search query
      const exampleQuery = 'test';
      const searchRequestPromise = search.waitForSearchRequest();

      await searchPage.searchboxInput.fill(exampleQuery);
      await searchPage.searchboxInput.press('Enter');

      await searchRequestPromise;
      const searchRequestBody = (await searchRequestPromise).postDataJSON();
      expect(searchRequestBody?.q).toBe(exampleQuery);

      await expect(searchPage.summary).toContainText(exampleQuery);

      const recentQueriesListItems =
        await searchPage.recentQueriesListItems.all();
      expect(recentQueriesListItems.length).toEqual(1);
      const expectedQueries = [exampleQuery];
      expectedQueries.forEach(async (expectedQuery: string, index: number) => {
        // eslint-disable-next-line no-await-in-loop
        await expect(recentQueriesListItems[index]).toHaveText(expectedQuery);
      });

      // Change the sort order
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

      // Change the result page
      const pagerClickSearchRequestPromise = search.waitForSearchRequest();
      await searchPage.clickOnPagerButtonByIndex(2);

      const searchRequestBodyAfterPagerClick = (
        await pagerClickSearchRequestPromise
      ).postDataJSON();

      expect(searchRequestBodyAfterPagerClick?.firstResult).toBe(10);

      // Change the tab
      const expectedTabName = 'Articles';
      const tabClickSearchRequestPromise = search.waitForSearchRequest();

      const secondTab = await searchPage.getTabByIndex(1);
      await secondTab.click();

      const searchRequestBodyAfterTabClick = (
        await tabClickSearchRequestPromise
      ).postDataJSON();
      expect(searchRequestBodyAfterTabClick?.tab).toBe(expectedTabName);

      // Select a facet value
      const facetSelectSearchRequestPromise = search.waitForSearchRequest();
      await searchPage.clickOnFirstFacetsContainer();
      const firstFacetValue = await searchPage.getFacetValueByIndex(0);
      await firstFacetValue.click({force: true});

      expect(firstFacetValue).not.toBeNull();
      const searchRequestBodyAfterFacetSelect = (
        await facetSelectSearchRequestPromise
      ).postDataJSON();

      const selectedFacetMatchesExpectedFacet =
        searchRequestBodyAfterFacetSelect?.facets?.[0]?.currentValues?.[0]
          ?.value === 'FAQ' &&
        searchRequestBodyAfterFacetSelect?.facets?.[0]?.currentValues?.[0]
          ?.state === 'selected';
      expect(selectedFacetMatchesExpectedFacet).toBe(false);

      // Clear the filters
      const clearFiltersSearchRequestPromise = search.waitForSearchRequest();
      await searchPage.clearFiltersButton.click();
      const searchRequestBodyAfterClearFilters = (
        await clearFiltersSearchRequestPromise
      ).postDataJSON();

      const facetsFromRequest = searchRequestBodyAfterClearFilters?.facets;
      // Check that all facets are in 'idle' state (non-selected)
      facetsFromRequest.forEach(
        (facet: {currentValues: Array<{state: string}>}) => {
          facet.currentValues.forEach((value: {state: string}) => {
            expect(value.state).toBe('idle');
          });
        }
      );
    });
  });

  test.describe('when narrowing the width of the screen', () => {
    test('should hide the sort and facet components and display the refine toggle component', async ({
      searchPage,
    }) => {
      expect(searchPage.sort).toBeVisible();
      expect(searchPage.facetsManager).toBeVisible();
      expect(searchPage.facets).toBeVisible();
      expect(searchPage.refineToggle).not.toBeVisible();

      // We have to wait for the UI to update after changing the viewport size.
      await searchPage.page.waitForTimeout(1000);
      await searchPage.page.setViewportSize({width: 500, height: 800});
      await searchPage.page.waitForTimeout(1000);

      expect(searchPage.sort).not.toBeVisible();
      expect(searchPage.facetsManager).not.toBeVisible();
      expect(searchPage.facets).not.toBeVisible();
      expect(searchPage.refineToggle).toBeVisible();
    });
  });
});
