import {expect, test} from './fixture';

test.describe('atomic-rating-facet', () => {
  test('should select and clear a rating value', async ({facet}) => {
    await facet.load({story: 'default'});

    await test.step('Verify clear button is not visible initially', async () => {
      await expect(facet.clearFilter).not.toBeVisible();
    });

    await test.step('Select a rating value', async () => {
      await facet.getFacetValueButtonByPosition(0).click();
    });

    await test.step('Verify value is selected and clear button appears', async () => {
      await expect(facet.getSelectedFacetValueBox).toHaveCount(1);
      await expect(facet.clearFilter).toBeVisible();
    });

    await test.step('Clear the selected value', async () => {
      await facet.clearFilter.click();
    });

    await test.step('Verify value is cleared and clear button disappears', async () => {
      await expect(facet.getSelectedFacetValueBox).toHaveCount(0);
      await expect(facet.clearFilter).not.toBeVisible();
    });
  });

  test('should select and clear rating value when displayed as links', async ({
    facet,
  }) => {
    await facet.load({story: 'display-as-link'});

    await test.step('Verify clear button is not visible initially', async () => {
      await expect(facet.clearFilter).not.toBeVisible();
    });

    await test.step('Select a rating value', async () => {
      await facet.getFacetValueButtonByPosition(0).click();
    });

    await test.step('Verify value is selected and clear button appears', async () => {
      await expect(facet.getSelectedFacetValueLink).toHaveCount(1);
      await expect(facet.clearFilter).toBeVisible();
    });

    await test.step('Clear the selected value', async () => {
      await facet.clearFilter.click();
    });

    await test.step('Verify value is cleared and clear button disappears', async () => {
      await expect(facet.getSelectedFacetValueLink).toHaveCount(0);
      await expect(facet.clearFilter).not.toBeVisible();
    });
  });

  // TODO: Issue #6691: Unskip visual tests after fixing CI snapshot issues
  test.skip('should match baseline in default state', async ({facet}) => {
    await test.step('Load facet and capture screenshot', async () => {
      await facet.load({story: 'default'});
      await facet.hydrated.waitFor();

      const screenshot = await facet.captureScreenshot();
      expect(screenshot).toMatchSnapshot('rating-facet-default.png', {
        // Setting maxDiffPixelRatio to 4% to avoid CI test failures due to minor rendering differences across environments
        maxDiffPixelRatio: 0.04,
      });
    });
  });

  // TODO: Issue #6691: Unskip visual tests after fixing CI snapshot issues
  test.skip('should match baseline with display-as-link', async ({facet}) => {
    await test.step('Load facet with display-as-link and capture screenshot', async () => {
      await facet.load({story: 'display-as-link'});
      await facet.hydrated.waitFor();

      const screenshot = await facet.captureScreenshot();
      expect(screenshot).toMatchSnapshot('rating-facet-display-as-link.png', {
        // Setting maxDiffPixelRatio to 4% to avoid CI test failures due to minor rendering differences across environments
        maxDiffPixelRatio: 0.04,
      });
    });
  });

  // TODO: Issue #6691: Unskip visual tests after fixing CI snapshot issues
  test.skip('should match baseline after selecting a value', async ({
    facet,
  }) => {
    await test.step('Load facet and select a value', async () => {
      await facet.load({story: 'default'});
      await facet.hydrated.waitFor();
      await facet.getFacetValueButtonByPosition(0).click();
    });

    await test.step('Capture and compare screenshot with selected value', async () => {
      const screenshot = await facet.captureScreenshot();
      expect(screenshot).toMatchSnapshot('rating-facet-after-selection.png', {
        // Setting maxDiffPixelRatio to 4% to avoid CI test failures due to minor rendering differences across environments
        maxDiffPixelRatio: 0.04,
      });
    });
  });
});
