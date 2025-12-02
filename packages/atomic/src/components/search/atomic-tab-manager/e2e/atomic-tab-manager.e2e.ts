import {expect, test} from './fixture';

test.describe('AtomicTabManager', () => {
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

  test('should not display tabs popover menu button on large viewport', async ({
    tabManager,
  }) => {
    await expect(tabManager.tabPopoverMenuButton).not.toBeVisible();
  });

  test.describe('when clicking on a tab button', () => {
    test.beforeEach(async ({tabManager}) => {
      await tabManager.tabButtons('Documentation').click();
    });

    test('should change active tab', async ({tabManager}) => {
      await expect(tabManager.activeTab).toHaveText(/Documentation/);
    });
  });
});
