import {expect, test} from './fixture';

test.describe('atomic-result-timespan', () => {
  test.beforeEach(async ({resultTimespan}) => {
    await resultTimespan.load({story: 'default'});
    await resultTimespan.hydrated.waitFor();
  });

  test('should render with default format', async ({resultTimespan}) => {
    await expect(resultTimespan.hydrated).toBeVisible();
    await expect(resultTimespan.hydrated).toContainText(':');
  });
});

test.describe('Visual Regression', () => {
  test('should match baseline in default state', async ({resultTimespan}) => {
    await resultTimespan.load({story: 'default'});
    await resultTimespan.hydrated.waitFor();

    const screenshot = await resultTimespan.captureScreenshot();
    expect(screenshot).toMatchSnapshot('result-timespan-default.png', {
      maxDiffPixelRatio: 0.01,
    });
  });
});
