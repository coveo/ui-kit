import {expect, test} from './fixture';

test.describe('atomic-insight-facet', () => {
  test('should render all essential parts', async ({insightFacet}) => {
    await insightFacet.load({story: 'default'});

    await test.step('Verify facet container is visible', async () => {
      await expect(insightFacet.facet).toBeVisible();
    });

    await test.step('Verify label button is visible', async () => {
      await expect(insightFacet.labelButton).toBeVisible();
    });

    await test.step('Verify facet values are visible', async () => {
      const count = await insightFacet.facetValue.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('display modes', () => {
    test('should render facet values as checkboxes by default', async ({
      insightFacet,
    }) => {
      await insightFacet.load({story: 'default'});
      await insightFacet.hydrated.waitFor();
      const checkbox = insightFacet.page.locator('[part~="value-checkbox"]');
      await expect(checkbox.first()).toBeVisible();
    });

    test('should render facet values as links when displayValuesAs is "link"', async ({
      insightFacet,
    }) => {
      await insightFacet.load({story: 'as-link'});
      await insightFacet.hydrated.waitFor();
      const link = insightFacet.page.locator('[part~="value-link"]');
      await expect(link.first()).toBeVisible();
    });

    test('should render facet values as boxes when displayValuesAs is "box"', async ({
      insightFacet,
    }) => {
      await insightFacet.load({story: 'as-box'});
      await insightFacet.hydrated.waitFor();
      const box = insightFacet.page.locator('[part~="value-box"]');
      await expect(box.first()).toBeVisible();
    });
  });

  test.describe('collapse and expand', () => {
    test('should start collapsed when is-collapsed is true', async ({
      insightFacet,
    }) => {
      await insightFacet.load({story: 'collapsed'});

      await test.step('Verify values are initially hidden', async () => {
        await expect(insightFacet.values).not.toBeVisible();
      });
    });

    test('should hide and show values when clicking the label button', async ({
      insightFacet,
    }) => {
      await insightFacet.load({story: 'default'});

      await test.step('Verify values are initially visible', async () => {
        await expect(insightFacet.values).toBeVisible();
      });

      await test.step('Click label button to collapse', async () => {
        await insightFacet.labelButton.click();
      });

      await test.step('Verify values are hidden after collapse', async () => {
        await expect(insightFacet.values).not.toBeVisible();
      });

      await test.step('Click label button to expand', async () => {
        await insightFacet.labelButton.click();
      });

      await test.step('Verify values are visible again after expand', async () => {
        await expect(insightFacet.values).toBeVisible();
      });
    });
  });

  test.describe('selected values', () => {
    test('should display selected value with visual indicator', async ({
      insightFacet,
    }) => {
      await insightFacet.load({story: 'with-selected-value'});

      await test.step('Verify selected checkbox has checked state', async () => {
        const selectedCheckbox = insightFacet.page.locator(
          '[part~="value-checkbox-checked"]'
        );
        await expect(selectedCheckbox.first()).toBeVisible();
      });
    });
  });

  test.describe('with exclusion enabled', () => {
    test.beforeEach(async ({insightFacet}) => {
      await insightFacet.load({story: 'with-exclusion'});
      await insightFacet.hydrated.waitFor();
    });

    test('should display exclusion buttons for selected values', async ({
      insightFacet,
    }) => {
      const firstValue = insightFacet.facetValue.first();
      await firstValue.click();
      const excludeButton = insightFacet.page.locator(
        '[part~="value-exclude-button"]'
      );
      await expect(excludeButton.first()).toBeVisible();
    });
  });

  test.describe('sort criteria - occurrences', () => {
    test.beforeEach(async ({insightFacet}) => {
      await insightFacet.load({
        args: {
          sortCriteria: 'occurrences',
          field: 'objecttype',
          label: 'Type',
          numberOfValues: 8,
        },
      });
      await insightFacet.hydrated.waitFor();
    });

    test('should have facet values sorted by occurrences in descending order', async ({
      insightFacet,
    }) => {
      const values = await insightFacet.facetValueOccurrences.allTextContents();
      const occurrences = values.map((v) =>
        parseInt(v.replace(/[^\d]/g, ''), 10)
      );

      // Verify counts are in descending order
      for (let i = 0; i < occurrences.length - 1; i++) {
        expect(occurrences[i]).toBeGreaterThanOrEqual(occurrences[i + 1]);
      }
    });
  });
});
