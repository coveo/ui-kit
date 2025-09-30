import {expect, test} from './fixture';

test.describe('atomic-search-box-query-suggestions', () => {
  test('should be accessible', async ({
    searchBoxQuerySuggestions,
    makeAxeBuilder,
  }) => {
    await searchBoxQuerySuggestions.load();

    await searchBoxQuerySuggestions.page.waitForTimeout(1000);

    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should load story page', async ({searchBoxQuerySuggestions, page}) => {
    await searchBoxQuerySuggestions.load();
    const pageTitle = await page.title();
    expect(pageTitle).toContain('Storybook');
  });

  test('should have basic component structure', async ({
    searchBoxQuerySuggestions,
    page,
  }) => {
    await searchBoxQuerySuggestions.load();

    await page.waitForTimeout(1000);

    const storyContent = page.locator('#storybook-root');
    await expect(storyContent).toBeAttached();
  });
});
