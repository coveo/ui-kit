import {expect, test} from './fixture';

test.describe('atomic-search-box-recent-queries', () => {
  test('should be accessible', async ({
    searchBoxRecentQueries,
    makeAxeBuilder,
  }) => {
    await searchBoxRecentQueries.load();

    await searchBoxRecentQueries.page.waitForTimeout(1000);

    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should load story page', async ({searchBoxRecentQueries, page}) => {
    await searchBoxRecentQueries.load();
    const pageTitle = await page.title();
    expect(pageTitle).toContain('Storybook');
  });

  test('should have basic component structure', async ({
    searchBoxRecentQueries,
    page,
  }) => {
    await searchBoxRecentQueries.load();

    await page.waitForTimeout(1000);

    const storyContent = page.locator('#storybook-root');
    await expect(storyContent).toBeAttached();
  });
});
