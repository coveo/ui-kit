import {expect, test} from './fixture';

test.describe('atomic-rating-facet', () => {
  test('should clear selection when clicking clear button', async ({facet}) => {
    await facet.load({story: 'default'});
    await facet.hydrated.waitFor();
    await facet.getFacetValueButtonByPosition(0).click();
    await expect(facet.getSelectedFacetValueBox).toHaveCount(1);

    await facet.clearFilter.click();
    await expect(facet.getSelectedFacetValueBox).toHaveCount(0);
  });

  test('should render links instead of checkboxes', async ({facet}) => {
    await facet.load({story: 'display-as-link'});
    await facet.hydrated.waitFor();
    await facet.getFacetValueButtonByPosition(0).click();
    await expect(facet.getSelectedFacetValueLink).toHaveCount(1);

    await facet.clearFilter.click();
    await expect(facet.getSelectedFacetValueLink).toHaveCount(0);
  });

  test.describe.skip('Visual Regression', () => {
    // TODO: Issue #6691: Unskip visual tests after fixing CI snapshot issues
    test.skip('should match baseline in default state', async ({facet}) => {
      await facet.load({story: 'default'});
      await facet.hydrated.waitFor();

      const screenshot = await facet.captureScreenshot();
      expect(screenshot).toMatchSnapshot('rating-facet-default.png', {
        maxDiffPixelRatio: 0.01,
      });
    });

    // TODO: Issue #6691: Unskip visual tests after fixing CI snapshot issues
    test.skip('should match baseline with display-as-link', async ({facet}) => {
      await facet.load({story: 'display-as-link'});
      await facet.hydrated.waitFor();

      const screenshot = await facet.captureScreenshot();
      expect(screenshot).toMatchSnapshot('rating-facet-display-as-link.png', {
        maxDiffPixelRatio: 0.01,
      });
    });

    // TODO: Issue #6691: Unskip visual tests after fixing CI snapshot issues
    test.skip('should match baseline after selecting a value', async ({
      facet,
    }) => {
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
