import {expect, test} from './fixture';

test.describe('atomic-rating-range-facet', () => {
  test.beforeEach(async ({ratingRangeFacet}) => {
    await ratingRangeFacet.load({story: 'default'});
    await ratingRangeFacet.hydrated.waitFor();
  });

  test('should exist in DOM with correct attributes', async ({
    ratingRangeFacet,
  }) => {
    const facetElement = ratingRangeFacet.hydrated;
    await expect(facetElement).toBeAttached();
  });

  test('should display facet values with ratings', async ({
    ratingRangeFacet,
  }) => {
    const values = ratingRangeFacet.values;
    await expect(values).toBeVisible();

    // Check that rating icons are displayed
    const ratingIcons = ratingRangeFacet.ratingIcons;
    await expect(ratingIcons.first()).toBeVisible();
  });

  test('should allow selecting a facet value', async ({
    ratingRangeFacet,
    page,
  }) => {
    // Initially no values should be selected
    await expect(ratingRangeFacet.selectedValues).toHaveCount(0);

    // Click on a facet value
    await ratingRangeFacet.valueLink(0).click();

    // Wait for selection to update
    await page.waitForTimeout(300);

    // One value should now be selected
    await expect(ratingRangeFacet.selectedValues).toHaveCount(1);

    // Clear button should be visible
    await expect(ratingRangeFacet.clearButton).toBeVisible();
  });

  test('should clear selections when clear button is clicked', async ({
    ratingRangeFacet,
    page,
  }) => {
    // Select a value
    await ratingRangeFacet.valueLink(0).click();
    await page.waitForTimeout(300);

    // Verify selection
    await expect(ratingRangeFacet.selectedValues).toHaveCount(1);

    // Click clear button
    await ratingRangeFacet.clearButton.click();
    await page.waitForTimeout(300);

    // No values should be selected
    await expect(ratingRangeFacet.selectedValues).toHaveCount(0);
  });
});

test.describe('Visual Regression', () => {
  test('should match baseline in default state', async ({ratingRangeFacet}) => {
    await ratingRangeFacet.load({story: 'default'});
    await ratingRangeFacet.hydrated.waitFor();

    const screenshot = await ratingRangeFacet.captureScreenshot();
    expect(screenshot).toMatchSnapshot('rating-range-facet-default.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('should match baseline after selecting a value', async ({
    ratingRangeFacet,
    page,
  }) => {
    await ratingRangeFacet.load({story: 'default'});
    await ratingRangeFacet.hydrated.waitFor();

    // Select a facet value
    await ratingRangeFacet.valueLink(0).click();
    await page.waitForTimeout(300);

    const screenshot = await ratingRangeFacet.captureScreenshot();
    expect(screenshot).toMatchSnapshot('rating-range-facet-selected.png', {
      maxDiffPixelRatio: 0.01,
    });
  });
});
