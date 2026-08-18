import {expect, type Page, test} from '@playwright/test';

// Atomic layouts are `display: none` until the interface finishes initializing
// and injects its generated layout styles. Waiting for the layout to become
// visible first means the component assertions below only measure hydrated
// elements instead of racing the interface bootstrap.
async function gotoPage(page: Page, path: string, layout: string) {
  await page.goto(`http://localhost:3000/${path}`);
  await expect(page.locator(layout)).toBeVisible();
}

test.describe('smoke test', () => {
  test.use({viewport: {width: 2000, height: 2000}});

  test('Search Page', async ({page}) => {
    await gotoPage(page, 'search.html', 'atomic-search-layout');

    await expect(page.locator('atomic-search-box')).toBeVisible();
    await expect(page.locator('atomic-result-list')).toBeVisible();
    await expect(page.locator('atomic-facet').first()).toBeVisible();
  });

  test('Commerce Search Page', async ({page}) => {
    await gotoPage(page, 'commerce.html', 'atomic-commerce-layout');

    await expect(page.locator('atomic-commerce-search-box')).toBeVisible();
    await expect(page.locator('atomic-commerce-product-list')).toBeVisible();
    await expect(page.locator('atomic-commerce-facets')).toBeVisible();
  });

  test('Insight Page', async ({page}) => {
    await gotoPage(page, 'insight.html', 'atomic-insight-layout');

    await expect(page.locator('atomic-insight-search-box')).toBeVisible();
    await expect(page.locator('atomic-insight-result-list')).toBeVisible();
    await expect(page.locator('atomic-insight-tab').first()).toBeVisible();
  });
});
