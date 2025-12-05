import {expect, test} from './fixture';

test.describe('atomic-tab-manager', () => {
  test.beforeEach(async ({tabManager}) => {
    await tabManager.load();
    await tabManager.hydrated.waitFor();
  });

  test('should display tabs area', async ({tabManager}) => {
    await expect(tabManager.tabArea).toBeVisible();
  });

  test('should display tab buttons for each atomic-tab element', async ({
    tabManager,
    page,
  }) => {
    // Start with a smaller viewport to trigger overflow
    await page.setViewportSize({width: 500, height: 1080});
    await tabManager.hydrated.waitFor();

    // Resize to larger viewport to show all tabs
    await page.setViewportSize({width: 1920, height: 1080});

    // Wait for ResizeObserver to recalculate and display all tabs
    await expect
      .poll(async () => {
        const count = await tabManager.tabButtons().count();
        return count;
      })
      .toBe(3);
    await expect(tabManager.tabButtons()).toHaveText([
      /All/,
      /Documentation/,
      /Articles/,
    ]);
  });
});
