import {expect, test} from './fixture';

test.describe('with facet values as link', () => {
  test.beforeEach(async ({facet}) => {
    await facet.load({story: 'display-as-link'});
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
