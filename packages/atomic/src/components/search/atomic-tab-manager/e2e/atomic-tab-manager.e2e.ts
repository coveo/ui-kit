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
  }) => {
    await expect(tabManager.tabButtons()).toHaveText([
      /All/,
      /Documentation/,
      /Articles/,
    ]);
  });
});
