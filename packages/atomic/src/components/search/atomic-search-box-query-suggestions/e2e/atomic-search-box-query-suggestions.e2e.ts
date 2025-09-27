import {expect, test} from './fixture';

test.describe('atomic-search-box-query-suggestions', () => {
  test('should have page object configured', async ({
    searchBoxQuerySuggestions,
  }) => {
    expect(searchBoxQuerySuggestions.component).toBeDefined();
    expect(searchBoxQuerySuggestions.searchBox).toBeDefined();
    expect(searchBoxQuerySuggestions.searchInput).toBeDefined();
    expect(typeof searchBoxQuerySuggestions.querySuggestions).toBe('function');
  });

  test('should validate component selectors', async ({page}) => {
    const selectors = await page.evaluate(() => {
      const testSelectors = [
        'atomic-search-box-query-suggestions',
        'atomic-search-box',
        '[part*="suggestion-item"]',
        '[aria-label*="suggested query"]',
      ];

      return testSelectors.map((selector) => ({
        isValidSelector: CSS.supports(`selector(${selector})`),
      }));
    });

    selectors.forEach(({isValidSelector}) => {
      expect(isValidSelector).toBe(true);
    });
  });

  test('should load story page', async ({searchBoxQuerySuggestions, page}) => {
    await searchBoxQuerySuggestions.load();
    const pageTitle = await page.title();
    expect(pageTitle).toContain('Storybook');
  });
});
