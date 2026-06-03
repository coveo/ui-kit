import {expect, test} from './fixture';

test.describe('atomic-search-box-query-suggestions', () => {
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
