import {expect, test} from '@playwright/test';

test.describe('Storybook Manager - Custom toolbar overrides', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should have the sb-bar toolbar element', async ({page}) => {
    const toolbar = page.locator('section.sb-bar');
    await expect(toolbar).toBeAttached();
  });

  test('should have the expected sb-bar child structure', async ({page}) => {
    const toolbarChild = page.locator('section.sb-bar > div > div:first-child');
    await expect(toolbarChild).toBeAttached();
  });

  test('should render the Coveo Docs search box in the toolbar', async ({
    page,
  }) => {
    const searchContainer = page.locator('#coveo-docs-search-container');
    await expect(searchContainer).toBeVisible();

    const searchBox = searchContainer.locator('atomic-search-box');
    await expect(searchBox).toBeVisible();
  });
});
