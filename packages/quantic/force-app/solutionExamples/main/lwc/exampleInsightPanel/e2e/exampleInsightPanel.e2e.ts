import {testInsight, expect} from './fixture';

let test = testInsight;

test.describe('Example Insight Panel E2E Tests', () => {
  test.describe('when loading the Insight Panel', () => {
    test('should render correctly and load results automatically', async ({insightPanel, search}) => {
      expect(insightPanel.insightPanel).toBeVisible();
      expect(insightPanel.searchbox).toBeVisible();
      expect(insightPanel.refineToggle).toBeVisible();
      expect(insightPanel.insightSummary).toBeVisible();
      expect(insightPanel.foldedResultList).toBeVisible();
      expect(insightPanel.tabBar).toBeVisible();
      expect(insightPanel.pager).toBeVisible();

      const firstResult = insightPanel.results.first();
      expect(firstResult).toBeVisible();
      expect(await firstResult.textContent()).not.toBeNull();

      const resultsCount = insightPanel.results.count();
      expect(await resultsCount).toBeGreaterThan(0);
    });
  });

  test.describe('the happy path:', () => {
    test('should allow the user to search, select a facet, change the tab, change the page and clear the filters', async ({insightPanel, search}) => {
      // Trigger a search
      const exampleQuery = 'Test';
      const searchRequestPromise = search.waitForSearchRequest();

      await insightPanel.searchboxInput.fill(exampleQuery);
      await insightPanel.searchboxInput.press('Enter');

      await searchRequestPromise;
      const searchRequestBody = (await searchRequestPromise).postDataJSON();
      expect(searchRequestBody?.q).toBe(exampleQuery);

      await expect(insightPanel.insightSummary).toContainText(exampleQuery);

      // Change the tab
      const expectedTabName = 'Articles';
      const tabClickSearchRequestPromise = search.waitForSearchRequest();

      const secondTab = await insightPanel.getTabByIndex(1);
      await secondTab.click();

      const searchRequestBodyAfterTabClick = (
        await tabClickSearchRequestPromise
      ).postDataJSON();
      expect(searchRequestBodyAfterTabClick?.tab).toBe(expectedTabName);

      // Change the page
      const pagerClickSearchRequestPromise = search.waitForSearchRequest();
      await insightPanel.clickOnPagerButtonByIndex(2);

      const searchRequestBodyAfterPagerClick = (
        await pagerClickSearchRequestPromise
      ).postDataJSON();

      expect(searchRequestBodyAfterPagerClick?.firstResult).toBe(5);

      // Select a facet value
      const facetSelectSearchRequestPromise = search.waitForSearchRequest();
      await insightPanel.clickOnRefineToggleButton();
      await insightPanel.clickOnFirstFacetsContainer();
      const firstFacetValue = await insightPanel.getFacetValueByIndex(0);
      await firstFacetValue.click({force: true});

      expect(firstFacetValue).not.toBeNull();
      const searchRequestBodyAfterFacetSelect = (
        await facetSelectSearchRequestPromise
      ).postDataJSON();

      const selectedFacetMatchesExpectedFacet =
      searchRequestBodyAfterFacetSelect?.facets?.[0]?.currentValues?.[0]?.value === 'Knowledge' &&
      searchRequestBodyAfterFacetSelect?.facets?.[0]?.currentValues?.[0]?.state === 'selected';
      expect(selectedFacetMatchesExpectedFacet).toBe(true);

      // Clear the filters
      const clearFiltersSearchRequestPromise = search.waitForSearchRequest();
      await insightPanel.clearFiltersButton.click();
      const searchRequestBodyAfterClearFilters = (
        await clearFiltersSearchRequestPromise
      ).postDataJSON();

      const facetsFromRequest = searchRequestBodyAfterClearFilters?.facets;
      // Check that all facets are in 'idle' state (non-selected)
      facetsFromRequest.forEach((facet: {currentValues: Array<{state: string}>}) => {
        facet.currentValues.forEach((value: {state: string}) => {
          expect(value.state).toBe('idle');
        });
      })
    });
  });
});
