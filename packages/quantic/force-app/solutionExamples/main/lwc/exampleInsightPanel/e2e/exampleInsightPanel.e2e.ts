import {testInsight, expect} from './fixture';
import type {SearchRequestBody} from './pageObject';

const test = testInsight;

test.describe('Example Insight Panel E2E Tests', () => {
  test.describe('when loading the Insight Panel', () => {
    test('should render correctly and load results automatically', async ({
      insightPanel,
      consoleErrors,
    }) => {
      await expect(insightPanel.errorComponent).not.toBeVisible();
      // Check for console errors, excluding a common 403 error that can occur because we use an API key and not a platform token.
      const consoleErrorWithout403 = consoleErrors.filter(
        (error) =>
          !error.includes(
            'Failed to load resource: the server responded with a status of 403 ()'
          )
      );
      expect(consoleErrorWithout403.length).toBe(0);

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

  test.describe('the happy path', () => {
    test('should allow the user to search, select a facet, change the tab, change the page and clear the filters', async ({
      insightPanel,
    }) => {
      test.slow();
      const getSelectedFacetValues = (body: SearchRequestBody) =>
        (body.facets ?? []).flatMap((facet) =>
          facet.currentValues.filter((value) => value.state === 'selected')
        );

      await expect(insightPanel.errorComponent).not.toBeVisible();
      // Trigger a search
      const exampleQuery = 'Test';
      const searchResponsePromise =
        insightPanel.waitForSuccessfulSearchResponse(
          (body) => body.q === exampleQuery
        );
      await insightPanel.searchboxInput.fill(exampleQuery);
      await insightPanel.searchboxInput.press('Enter');
      await searchResponsePromise;

      await expect(insightPanel.insightSummary).toContainText(exampleQuery);

      // Change the tab
      const secondTab = await insightPanel.getTabByIndex(1);
      const expectedTabName = await secondTab.textContent();
      const tabClickSearchResponsePromise =
        insightPanel.waitForSuccessfulSearchResponse(
          (body) => body.tab === expectedTabName
        );
      await secondTab.click();
      await tabClickSearchResponsePromise;

      // Change the page
      const pagerClickSearchResponsePromise =
        insightPanel.waitForSuccessfulSearchResponse(
          (body) => body.firstResult === 5
        );
      await insightPanel.clickOnPagerButtonByIndex(2);
      const searchRequestBodyAfterPagerClick: SearchRequestBody = (
        await pagerClickSearchResponsePromise
      )
        .request()
        .postDataJSON();
      expect(searchRequestBodyAfterPagerClick.tab).toBe(expectedTabName);

      // Select a facet value
      const facetSelectSearchResponsePromise =
        insightPanel.waitForSuccessfulSearchResponse(
          (body) => getSelectedFacetValues(body).length > 0
        );
      await insightPanel.clickOnRefineToggleButton();
      await insightPanel.clickOnFirstFacetsContainer();
      const firstFacetValue = await insightPanel.getFacetValueByIndex(0);
      await firstFacetValue.waitFor({state: 'visible'});
      await firstFacetValue.click();

      const selectedFacetValues = getSelectedFacetValues(
        (await facetSelectSearchResponsePromise).request().postDataJSON()
      );
      expect(selectedFacetValues).toHaveLength(1);
      const cleanedFirstFacetValue = (
        await firstFacetValue.textContent()
      )?.replace('Facet value option', '');
      expect(cleanedFirstFacetValue).toContain(selectedFacetValues[0].value);

      // Clear the filters
      const clearFiltersSearchResponsePromise =
        insightPanel.waitForSuccessfulSearchResponse(
          (body) => getSelectedFacetValues(body).length === 0
        );
      await insightPanel.clearFiltersButton.click();
      const searchRequestBodyAfterClearFilters: SearchRequestBody = (
        await clearFiltersSearchResponsePromise
      )
        .request()
        .postDataJSON();
      expect(searchRequestBodyAfterClearFilters.facets?.length).toBeGreaterThan(
        0
      );
    });
  });
});
