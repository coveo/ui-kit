import {expect, test} from './fixture';

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
