import {expect, test} from './fixture';

test.describe('atomic-segmented-facet', () => {
  test.beforeEach(async ({segmentedFacet}) => {
    await segmentedFacet.load();
    await segmentedFacet.hydrated.waitFor();
  });

  test('should exist in DOM with correct attributes', async ({
    segmentedFacet,
  }) => {
    await expect(segmentedFacet.hydrated).toBeAttached();
  });

  test('should display facet values', async ({segmentedFacet}) => {
    await expect(segmentedFacet.valuesContainer).toBeVisible();
    await expect(segmentedFacet.valueBoxes.first()).toBeVisible();
  });

  test('should display label when provided', async ({segmentedFacet}) => {
    await expect(segmentedFacet.label).toBeVisible();
    await expect(segmentedFacet.label).toContainText('Object Type');
  });

  test('should select a value when clicked', async ({segmentedFacet}) => {
    const firstValue = segmentedFacet.valueAtIndex(0);
    await firstValue.click();

    await expect(segmentedFacet.selectedValueBox).toBeVisible();
  });
});

test.describe('Visual Regression', () => {
  test('should match baseline in default state', async ({segmentedFacet}) => {
    await segmentedFacet.load();
    await segmentedFacet.hydrated.waitFor();

    const screenshot = await segmentedFacet.captureScreenshot();
    expect(screenshot).toMatchSnapshot('segmented-facet-default.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('should match baseline after selecting a value', async ({
    segmentedFacet,
  }) => {
    await segmentedFacet.load();
    await segmentedFacet.hydrated.waitFor();

    // Select the first value
    await segmentedFacet.valueAtIndex(0).click();
    await segmentedFacet.page.waitForTimeout(300);

    const screenshot = await segmentedFacet.captureScreenshot();
    expect(screenshot).toMatchSnapshot('segmented-facet-selected.png', {
      maxDiffPixelRatio: 0.01,
    });
  });
});
