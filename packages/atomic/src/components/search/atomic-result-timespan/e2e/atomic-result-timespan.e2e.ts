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

  test('should display time in HH:mm:ss format', async ({resultTimespan}) => {
    await expect(resultTimespan.hydrated).toBeVisible();

    // Check that the time format matches HH:mm:ss pattern
    const text = await resultTimespan.hydrated.textContent();
    expect(text).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  test('should have proper accessibility attributes', async ({
    resultTimespan,
  }) => {
    await expect(resultTimespan.hydrated).toBeVisible();

    // Component should be in the accessibility tree
    await expect(resultTimespan.hydrated).toBeInViewport();
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
