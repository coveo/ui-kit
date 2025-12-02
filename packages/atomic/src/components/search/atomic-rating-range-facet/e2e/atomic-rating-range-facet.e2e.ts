import {expect, test} from './fixture';

test.describe('atomic-rating-range-facet', () => {
  test.beforeEach(async ({ratingRangeFacet}) => {
    await ratingRangeFacet.load({story: 'default'});
    await ratingRangeFacet.hydrated.waitFor();
  });

  test('should select and clear a rating value', async ({ratingRangeFacet}) => {
    await ratingRangeFacet.load({story: 'default'});
    await ratingRangeFacet.hydrated.waitFor();
    await expect(ratingRangeFacet.clearButton()).not.toBeVisible();

    await ratingRangeFacet.valueLink(0).click();
    await expect(ratingRangeFacet.selectedValueLinks()).toHaveCount(1);

    await ratingRangeFacet.clearButton().click();
    await expect(ratingRangeFacet.selectedValueLinks()).toHaveCount(0);
  });

  test('should match baseline in default state', async ({ratingRangeFacet}) => {
    test.skip(process.env.CI !== 'true', 'Visual test only in CI');
    await ratingRangeFacet.load({story: 'default'});
    await ratingRangeFacet.hydrated.waitFor();

    const screenshot = await ratingRangeFacet.captureScreenshot();
    expect(screenshot).toMatchSnapshot('rating-range-facet-default.png', {
      // Setting maxDiffPixelRatio to 4% to avoid CI test failures due to minor rendering differences across environments
      maxDiffPixelRatio: 0.04,
    });
  });

  test('should match baseline after selecting a value', async ({
    ratingRangeFacet,
  }) => {
    test.skip(process.env.CI !== 'true', 'Visual test only in CI');

    await ratingRangeFacet.load({story: 'default'});
    await ratingRangeFacet.hydrated.waitFor();
    await ratingRangeFacet.valueLink(0).click();

    const screenshot = await ratingRangeFacet.captureScreenshot();
    expect(screenshot).toMatchSnapshot('rating-range-facet-selected.png', {
      // Setting maxDiffPixelRatio to 4% to avoid CI test failures due to minor rendering differences across environments
      maxDiffPixelRatio: 0.04,
    });
  });
});
