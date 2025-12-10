import {expect, test} from './fixture';

test.describe('atomic-facet-manager', () => {
  test('should render with default collapse behavior', async ({component}) => {
    await test.step('Load component with default settings', async () => {
      await component.load({story: 'default'});
      await component.hydrated.waitFor();
    });

    await test.step('Verify 4 facets are expanded by default', async () => {
      await expect(component.expandedFacets).toHaveCount(4);
      await expect(component.collapsedFacets).toHaveCount(0);
    });
  });
});

test.describe('Visual Regression', () => {
  test('should match baseline in default state', async ({component}) => {
    await test.step('Load component', async () => {
      await component.load({story: 'default'});
      await component.hydrated.waitFor();
    });

    await test.step('Capture and compare screenshot', async () => {
      const screenshot = await component.captureScreenshot();
      expect(screenshot).toMatchSnapshot('facet-manager-default.png', {
        maxDiffPixelRatio: 0.04,
      });
    });
  });
});
