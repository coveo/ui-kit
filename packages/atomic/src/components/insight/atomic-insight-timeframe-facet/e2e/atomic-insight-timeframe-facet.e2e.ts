import {expect, test} from './fixture';

test.describe('atomic-insight-timeframe-facet', () => {
  test('should load and display facet with values', async ({facet}) => {
    await facet.load();

    await expect(facet.facet).toBeVisible();
    await expect(facet.facetValues.first()).toBeVisible();
  });
});
