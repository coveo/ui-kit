import {expect, test} from './fixture';

test.describe('Functional Tests', () => {
  test('should render atomic-tab-bar wrapper', async ({component}) => {
    await test.step('Load component', async () => {
      await component.load({story: 'default'});
      await component.hydrated.waitFor();
    });

    await test.step('Verify tab bar is rendered', async () => {
      const tabBar = component.tabBar;
      await expect(tabBar).toBeAttached();
    });
  });

  test('should render slotted tab elements', async ({component}) => {
    await test.step('Load component with tabs', async () => {
      await component.load({story: 'default'});
      await component.hydrated.waitFor();
    });

    await test.step('Verify slotted tabs are present', async () => {
      const tabs = component.page.locator('atomic-ipx-tab');
      await expect(tabs).toHaveCount(3);
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
      expect(screenshot).toMatchSnapshot('ipx-tabs-default.png', {
        maxDiffPixelRatio: 0.04,
      });
    });
  });
});
