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

  test('should display selected value with visual indicator', async ({
    insightFacet,
  }) => {
    await insightFacet.load({story: 'with-selected-value'});
    await insightFacet.hydrated.waitFor();

    await test.step('Verify selected value has checked state', async () => {
      const selectedCheckbox = insightFacet.page.locator(
        '[part~="value-checkbox-checked"]'
      );
      await expect(selectedCheckbox.first()).toBeVisible();
      await expect(selectedCheckbox.first()).toHaveAttribute(
        'aria-checked',
        'true'
      );
    });
  });

  test('should collapse and hide values when clicking the label button', async ({
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
