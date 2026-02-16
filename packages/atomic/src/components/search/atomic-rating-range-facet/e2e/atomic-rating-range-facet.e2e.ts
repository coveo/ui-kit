import {expect, test} from './fixture';

test.describe('atomic-rating-range-facet', () => {
  test('should render all essential parts', async ({ratingRangeFacet}) => {
    await ratingRangeFacet.load({story: 'default'});

    await test.step('Verify facet container is visible', async () => {
      await expect(ratingRangeFacet.facet).toBeVisible();
    });

    await test.step('Verify facet label button is visible', async () => {
      await expect(ratingRangeFacet.labelButton).toBeVisible();
    });

    await test.step('Verify facet values are visible', async () => {
      await expect(ratingRangeFacet.values).toBeVisible();
      await expect(ratingRangeFacet.valueLinks).toHaveCount(5); // Default number of intervals
    });

    await test.step('Verify rating icons are visible', async () => {
      await expect(ratingRangeFacet.ratingIcons).toHaveCount(50); // 5 intervals × 5 stars each x (filled + unfilled)
    });

    await test.step('Verify clear button is not visible initially', async () => {
      await expect(ratingRangeFacet.clearButton).not.toBeVisible();
    });
  });

  test('should select and clear a rating value', async ({ratingRangeFacet}) => {
    await ratingRangeFacet.load({story: 'default'});

    await test.step('Verify clear button is not visible initially', async () => {
      await expect(ratingRangeFacet.clearButton).not.toBeVisible();
    });

    await test.step('Select a rating value', async () => {
      await ratingRangeFacet.valueLink(0).click();
    });

    await test.step('Verify value is selected and clear button appears', async () => {
      await expect(ratingRangeFacet.selectedValueLinks).toHaveCount(1);
      await expect(ratingRangeFacet.clearButton).toBeVisible();
    });

    await test.step('Clear the selected value', async () => {
      await ratingRangeFacet.clearButton.click();
    });

    await test.step('Verify value is cleared and clear button disappears', async () => {
      await expect(ratingRangeFacet.selectedValueLinks).toHaveCount(0);
      await expect(ratingRangeFacet.clearButton).not.toBeVisible();
    });
  });

  test('should collapse and hide values when clicking the label button', async ({
    ratingRangeFacet,
  }) => {
    await ratingRangeFacet.load({story: 'default'});

    await test.step('Verify values are initially visible', async () => {
      await expect(ratingRangeFacet.values).toBeVisible();
    });

    await test.step('Click label button to collapse', async () => {
      await ratingRangeFacet.labelButton.click();
    });

    await test.step('Verify values are hidden after collapse', async () => {
      await expect(ratingRangeFacet.values).not.toBeVisible();
    });

    await test.step('Click label button to expand', async () => {
      await ratingRangeFacet.labelButton.click();
    });

    await test.step('Verify values are visible again after expand', async () => {
      await expect(ratingRangeFacet.values).toBeVisible();
    });
  });

  test('should display selected value with visual indicator', async ({
    ratingRangeFacet,
  }) => {
    await ratingRangeFacet.load({story: 'default'});

    await test.step('Select a rating value', async () => {
      await ratingRangeFacet.valueLink(2).click(); // Select 3-star rating
    });

    await test.step('Verify selected value has selected styling', async () => {
      await expect(ratingRangeFacet.selectedValueLinks).toHaveCount(1);
      await expect(ratingRangeFacet.selectedValueLinks.first()).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });
  });

  // TODO: Issue #6691: Unskip visual tests after fixing CI snapshot issues
  test.skip('should match baseline in default state', async ({
    ratingRangeFacet,
  }) => {
    await test.step('Load facet in default state', async () => {
      await ratingRangeFacet.load({story: 'default'});
      await ratingRangeFacet.hydrated.waitFor();
    });

    await test.step('Capture and compare screenshot', async () => {
      const screenshot = await ratingRangeFacet.captureScreenshot();
      expect(screenshot).toMatchSnapshot('rating-range-facet-default.png', {
        // Setting maxDiffPixelRatio to 4% to avoid CI test failures due to minor rendering differences across environments
        maxDiffPixelRatio: 0.04,
      });
    });
  });

  // TODO: Issue #6691: Unskip visual tests after fixing CI snapshot issues
  test.skip('should match baseline after selecting a value', async ({
    ratingRangeFacet,
  }) => {
    await test.step('Load facet and select a value', async () => {
      await ratingRangeFacet.load({story: 'default'});
      await ratingRangeFacet.hydrated.waitFor();
      await ratingRangeFacet.valueLink(0).click();
    });

    await test.step('Capture and compare screenshot with selected value', async () => {
      const screenshot = await ratingRangeFacet.captureScreenshot();
      expect(screenshot).toMatchSnapshot('rating-range-facet-selected.png', {
        // Setting maxDiffPixelRatio to 4% to avoid CI test failures due to minor rendering differences across environments
        maxDiffPixelRatio: 0.04,
      });
    });
  });
});
