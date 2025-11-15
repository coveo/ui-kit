import {expect, test} from './fixture';

test.describe('atomic-segmented-facet-scrollable', () => {
  test.beforeEach(async ({segmentedFacetScrollable}) => {
    await segmentedFacetScrollable.load();
  });

  test('it loads properly', async ({segmentedFacetScrollable}) => {
    await expect(segmentedFacetScrollable.hydrated).toBeVisible();
  });
});
