import {expect, test} from './fixture';

test.describe('atomic-facet-manager', () => {
  test('should render with default collapse behavior', async ({component}) => {
    await test.step('Load component with default settings', async () => {
      await component.load({story: 'default'});
      await component.page.waitForSelector('atomic-facet-manager');
    });

    await test.step('Verify 4 facets are expanded by default', async () => {
      await expect(component.expandedFacets).toHaveCount(4);
      await expect(component.collapsedFacets).toHaveCount(0);
    });
  });

  test('should manage facet visibility', async ({component}) => {
    await test.step('Load component', async () => {
      await component.load({story: 'default'});
      await component.page.waitForSelector('atomic-facet-manager');
    });

    await test.step('Verify all facets are present', async () => {
      await expect(component.facets).toHaveCount(4);
    });
  });

  test('should respect collapseFacetsAfter attribute', async ({component}) => {
    await test.step('Load component with custom collapse setting', async () => {
      await component.load({
        story: 'default',
        args: {'collapse-facets-after': 2},
      });
      await component.page.waitForSelector('atomic-facet-manager');
    });

    await test.step('Verify only 2 facets are expanded', async () => {
      await expect(component.expandedFacets).toHaveCount(2);
      await expect(component.collapsedFacets).toHaveCount(2);
    });
  });
});

test.describe('Visual Regression', () => {
  test('should match baseline in default state', async ({component}) => {
    await test.step('Load component', async () => {
      await component.load({story: 'default'});
      await component.page.waitForSelector('atomic-facet-manager');
    });

    await test.step('Capture and compare screenshot', async () => {
      const screenshot = await component.captureScreenshot();
      expect(screenshot).toMatchSnapshot('facet-manager-default.png', {
        maxDiffPixelRatio: 0.04,
      });
    });
  });
});
