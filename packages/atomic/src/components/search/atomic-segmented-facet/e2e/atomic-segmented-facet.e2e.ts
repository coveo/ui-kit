import {expect, test} from './fixture';

test.describe('atomic-segmented-facet', () => {
  test.beforeEach(async ({segmentedFacet}) => {
    await segmentedFacet.load();
  });

  test('it loads properly', async ({segmentedFacet}) => {
    await expect(segmentedFacet.hydrated).toBeVisible();
  });

  test('displays facet values', async ({segmentedFacet}) => {
    await expect(segmentedFacet.segmentedContainer).toBeVisible();
    await expect(segmentedFacet.valueBoxes.first()).toBeVisible();
  });

  test('displays label when provided', async ({segmentedFacet}) => {
    await expect(segmentedFacet.label).toBeVisible();
  });
});
