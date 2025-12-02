import {expect, test} from './fixture';

test.describe('AtomicResultIcon', () => {
  test.beforeEach(async ({resultIcon}) => {
    await resultIcon.load();
    await resultIcon.hydrated.waitFor();
  });

  test('should load and display an icon', async ({resultIcon}) => {
    await expect(resultIcon.svg).toBeVisible();
    await expect(resultIcon.atomicIcon).toBeVisible();
  });

  test('should match baseline in default state', async ({resultIcon}) => {
    const screenshot = await resultIcon.captureScreenshot();
    expect(screenshot).toMatchSnapshot('atomic-result-icon-default.png', {
      maxDiffPixelRatio: 0.01,
    });
  });
});
