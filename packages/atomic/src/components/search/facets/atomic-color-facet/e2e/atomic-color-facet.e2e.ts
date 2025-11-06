import {expect, test} from './fixture';

test.describe('atomic-color-facet E2E tests', () => {
  test.describe('when clicking facet search "More matches for"', () => {
    test.beforeEach(async ({facet}) => {
      await facet.load({story: 'low-facet-values'});
    });

    test('should display an increasing number of matches', async ({facet}) => {
      await facet.getFacetSearch.click();
      await facet.getFacetSearch.pressSequentially('p');
      await expect
        .poll(async () => {
          return await facet.getFacetValue.count();
        })
        .toBeGreaterThanOrEqual(2);

      await facet.facetSearchMoreMatchesFor.click();
      await expect
        .poll(async () => {
          return await facet.getFacetValue.count();
        })
        .toBeGreaterThanOrEqual(4);

      await facet.facetSearchMoreMatchesFor.click();
      await expect
        .poll(async () => {
          return await facet.getFacetValue.count();
        })
        .toBeGreaterThanOrEqual(6);
    });
  });

  test.describe('accessibility', () => {
    test.beforeEach(async ({facet}) => {
      await facet.load();
    });

    test('should have no accessibility violations', async ({facet}) => {
      await expect(facet.hydrated).toBeAttached();
      // Component should be accessible with keyboard navigation
      const firstValue = facet.getFacetValue.first();
      await expect(firstValue).toBeVisible();
    });
  });

  test.describe('collapse and expand', () => {
    test.beforeEach(async ({facet}) => {
      await facet.load();
    });

    test('should collapse when label button is clicked', async ({facet}) => {
      await expect(facet.facetValues).toBeVisible();
      await facet.labelButton.click();
      await expect(facet.facetValues).not.toBeVisible();
    });

    test('should expand when label button is clicked again', async ({
      facet,
    }) => {
      await facet.labelButton.click();
      await expect(facet.facetValues).not.toBeVisible();
      await facet.labelButton.click();
      await expect(facet.facetValues).toBeVisible();
    });
  });

  test.describe('show more and show less', () => {
    test.beforeEach(async ({facet}) => {
      await facet.load();
    });

    test('should show more values when show more is clicked', async ({
      facet,
    }) => {
      const initialCount = await facet.getFacetValue.count();
      await facet.showMoreButton.click();
      await expect
        .poll(async () => await facet.getFacetValue.count())
        .toBeGreaterThan(initialCount);
    });

    test('should show less values when show less is clicked after show more', async ({
      facet,
    }) => {
      const initialCount = await facet.getFacetValue.count();
      await facet.showMoreButton.click();
      await expect
        .poll(async () => await facet.getFacetValue.count())
        .toBeGreaterThan(initialCount);

      await facet.showLessButton.click();
      await expect
        .poll(async () => await facet.getFacetValue.count())
        .toBe(initialCount);
    });
  });

  test.describe('clear functionality', () => {
    test.beforeEach(async ({facet}) => {
      await facet.load();
    });

    test('should clear selection when clear button is clicked', async ({
      facet,
    }) => {
      const firstValue = facet.getFacetValue.first();
      await firstValue.click();

      await expect(facet.clearButton).toBeVisible();
      await facet.clearButton.click();
      await expect(facet.clearButton).not.toBeVisible();
    });
  });
});
