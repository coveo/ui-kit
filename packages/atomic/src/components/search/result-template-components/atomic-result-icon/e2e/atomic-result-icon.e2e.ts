import {expect, test} from './fixture';

test.describe('AtomicResultIcon', () => {
  test.beforeEach(async ({resultIcon}) => {
    await resultIcon.load();
  });

  test('should load and display an icon', async ({resultIcon}) => {
    await expect(resultIcon.svg).toBeVisible();
  });

  test('should render atomic-icon element', async ({resultIcon}) => {
    await expect(resultIcon.atomicIcon).toBeVisible();
  });

  test('should have correct structure in shadow DOM', async ({resultIcon}) => {
    // Wait for component to hydrate
    await resultIcon.hydrated.waitFor();

    // Verify the atomic-icon is present
    const atomicIcon = resultIcon.atomicIcon;
    await expect(atomicIcon).toHaveCount(1);
  });

  test('should be accessible', async ({resultIcon}) => {
    // Wait for component to be fully loaded
    await resultIcon.hydrated.waitFor();

    // The icon should have a title for accessibility
    const atomicIcon = resultIcon.atomicIcon;
    await expect(atomicIcon).toHaveAttribute('title');
  });
});

test.describe('Visual Regression', () => {
  test('should match baseline in default state', async ({resultIcon}) => {
    await resultIcon.load({story: 'default'});
    await resultIcon.hydrated.waitFor();

    const screenshot = await resultIcon.captureScreenshot();
    expect(screenshot).toMatchSnapshot('atomic-result-icon-default.png', {
      maxDiffPixelRatio: 0.01,
    });
  });
});
