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

    const ratingIcons = ratingRangeFacet.ratingIcons;
    await expect(ratingIcons.first()).toBeVisible();
  });

  test('should allow selecting a facet value', async ({ratingRangeFacet}) => {
    await expect(ratingRangeFacet.selectedValues).toHaveCount(0);

    await ratingRangeFacet.valueLink(0).click();

    await expect(ratingRangeFacet.selectedValues).toHaveCount(1);
    await expect(ratingRangeFacet.clearButton).toBeVisible();
  });

  test('should clear selections when clear button is clicked', async ({
    ratingRangeFacet,
  }) => {
    await ratingRangeFacet.valueLink(0).click();
    await expect(ratingRangeFacet.selectedValues).toHaveCount(1);

    await ratingRangeFacet.clearButton.click();
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
  }) => {
    await ratingRangeFacet.load({story: 'default'});
    await ratingRangeFacet.hydrated.waitFor();

    await ratingRangeFacet.valueLink(0).click();
    await expect(ratingRangeFacet.selectedValues).toHaveCount(1);

    const screenshot = await ratingRangeFacet.captureScreenshot();
    expect(screenshot).toMatchSnapshot('rating-range-facet-selected.png', {
      maxDiffPixelRatio: 0.01,
    });
  });
});
