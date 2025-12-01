import {expect, test} from './fixture';

test.describe('atomic-rating-range-facet', () => {
  test.beforeEach(async ({ratingRangeFacet}) => {
    await ratingRangeFacet.load({story: 'default'});
    await ratingRangeFacet.hydrated.waitFor();
  });

  test('should match baseline in default state', async ({ratingRangeFacet}) => {
    await ratingRangeFacet.load({story: 'default'});
    await ratingRangeFacet.hydrated.waitFor();

    const screenshot = await ratingRangeFacet.captureScreenshot();
    expect(screenshot).toMatchSnapshot('rating-range-facet-default.png', {
      maxDiffPixelRatio: 0.04,
    });
  });

  test('should match baseline after selecting a value', async ({
    ratingRangeFacet,
  }) => {
    await ratingRangeFacet.load({story: 'default'});
    await ratingRangeFacet.hydrated.waitFor();
    await ratingRangeFacet.valueLink(0).click();

    const screenshot = await ratingRangeFacet.captureScreenshot();
    expect(screenshot).toMatchSnapshot('rating-range-facet-selected.png', {
      maxDiffPixelRatio: 0.04,
    });
  });
});
