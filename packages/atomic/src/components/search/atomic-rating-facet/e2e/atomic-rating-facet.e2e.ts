import {expect, test} from './fixture';

test.describe('atomic-rating-facet', () => {
  test.describe('default rendering', () => {
    test.beforeEach(async ({facet}) => {
      await facet.load({story: 'default'});
    });

    test('should render rating facet with values', async ({facet}) => {
      await facet.hydrated.waitFor();
      const values = await facet.facetValues.all();
      expect(values.length).toBeGreaterThan(0);
    });

    test('should render rating icons for each value', async ({facet}) => {
      await facet.hydrated.waitFor();
      const ratingIcons = await facet.component
        .locator('[part~="value-rating-icon"]')
        .all();
      expect(ratingIcons.length).toBeGreaterThan(0);
    });

    test('should show checkboxes by default', async ({facet}) => {
      await facet.hydrated.waitFor();
      const checkbox = await facet.component
        .locator('[part~="value-checkbox"]')
        .first();
      await expect(checkbox).toBeVisible();
    });

    test('should allow selecting a value', async ({facet}) => {
      await facet.hydrated.waitFor();
      const firstValue = facet.getFacetValueButtonByPosition(0);
      await firstValue.click();

      const selected = await facet.component
        .locator('[part~="value-checkbox-checked"]')
        .first();
      await expect(selected).toBeVisible();
    });

    test('should show clear button after selection', async ({facet}) => {
      await facet.hydrated.waitFor();
      await facet.getFacetValueButtonByPosition(0).click();
      await expect(facet.clearFilter).toBeVisible();
    });

    test('should clear selection when clicking clear button', async ({
      facet,
    }) => {
      await facet.hydrated.waitFor();
      await facet.getFacetValueButtonByPosition(0).click();
      await facet.clearFilter.click();

      const selected = await facet.component
        .locator('[part~="value-checkbox-checked"]')
        .all();
      expect(selected.length).toBe(0);
    });
  });

  test.describe('with facet values as link', () => {
    test.beforeEach(async ({facet}) => {
      await facet.load({story: 'display-as-link'});
    });

    test('should render links instead of checkboxes', async ({facet}) => {
      await facet.hydrated.waitFor();
      const link = await facet.component
        .locator('[part~="value-link"]')
        .first();
      await expect(link).toBeVisible();
    });

    test.describe('when no value is selected', () => {
      test('should not dim any facet values', async ({facet}) => {
        const facetValues = await facet.facetValues.all();
        for (let i = 0; i < facetValues.length; i++) {
          await expect(facetValues[i]).toHaveCSS('opacity', '1');
        }
      });
    });

    test.describe('when selecting a value', () => {
      test.beforeEach(async ({facet}) => {
        await facet.getFacetValueButtonByPosition(0).click();
      });

      test('should dim unselected facet values', async ({facet}) => {
        const facetValues = await facet.facetValues.all();
        for (let i = 1; i < facetValues.length; i++) {
          await expect(facetValues[i]).toHaveCSS('opacity', '0.8');
        }
      });

      test('should not dim selected facet', async ({facet}) => {
        await expect(facet.facetValues.nth(0)).toHaveCSS('opacity', '1');
      });

      test('should show selected link style', async ({facet}) => {
        const selectedLink = facet.getSelectedFacetValueLink;
        await expect(selectedLink).toBeVisible();
      });
    });
  });

  test.describe('accessibility', () => {
    test.beforeEach(async ({facet}) => {
      await facet.load({story: 'default'});
      await facet.hydrated.waitFor();
    });

    test('should have accessible facet values as list items', async ({
      facet,
    }) => {
      const listItems = await facet.facetValues.all();
      expect(listItems.length).toBeGreaterThan(0);
    });

    test('should have clickable buttons for each value', async ({facet}) => {
      const firstButton = facet.getFacetValueButtonByPosition(0);
      await expect(firstButton).toBeVisible();
      await expect(firstButton).toBeEnabled();
    });

    test('should show result counts for each value', async ({facet}) => {
      const counts = await facet.component
        .locator('[part~="value-count"]')
        .all();
      expect(counts.length).toBeGreaterThan(0);
    });
  });

  test.describe('Visual Regression', () => {
    test('should match baseline in default state', async ({facet}) => {
      await facet.load({story: 'default'});
      await facet.hydrated.waitFor();

      const screenshot = await facet.captureScreenshot();
      expect(screenshot).toMatchSnapshot('rating-facet-default.png', {
        maxDiffPixelRatio: 0.01,
      });
    });

    test('should match baseline with display-as-link', async ({facet}) => {
      await facet.load({story: 'display-as-link'});
      await facet.hydrated.waitFor();

      const screenshot = await facet.captureScreenshot();
      expect(screenshot).toMatchSnapshot('rating-facet-display-as-link.png', {
        maxDiffPixelRatio: 0.01,
      });
    });

    test('should match baseline after selecting a value', async ({facet}) => {
      await facet.load({story: 'default'});
      await facet.hydrated.waitFor();

      await facet.getFacetValueButtonByPosition(0).click();
      await facet.page.waitForTimeout(300);

      const screenshot = await facet.captureScreenshot();
      expect(screenshot).toMatchSnapshot('rating-facet-after-selection.png', {
        maxDiffPixelRatio: 0.01,
      });
    });
  });
});
