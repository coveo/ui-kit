import {scanPageAccessibility} from '../../../../../playwright-utils/axe-helper';
import {expect, test} from './fixture';

test.describe('atomic-insight-search-box', () => {
  test.describe('accessibility', () => {
    test.beforeEach(async ({searchBox}) => {
      await searchBox.load();
    });

    test('should have no accessibility violations at desktop viewport', async ({
      page,
    }) => {
      const results = await scanPageAccessibility(page, {
        viewport: 'desktop',
      });
      expect(results.violations).toEqual([]);
    });

    test('should have no accessibility violations at mobile viewport', async ({
      page,
    }) => {
      const results = await scanPageAccessibility(page, {viewport: 'mobile'});
      expect(results.violations).toEqual([]);
    });
  });

  test.beforeEach(async ({searchBox}) => {
    await searchBox.load();
  });

  test('should render the search input', async ({searchBox}) => {
    await expect(searchBox.searchInput).toBeVisible();
  });

  test('should render suggestions when focused', async ({searchBox}) => {
    await searchBox.searchInput.click();
    await expect(searchBox.suggestionsWrapper).toBeVisible();
    await expect(searchBox.searchSuggestions().first()).toBeVisible();
  });

  test('should submit search on Enter', async ({searchBox}) => {
    await searchBox.searchInput.click();
    await searchBox.typeInSearchBox('test query');
    await searchBox.submitSearch();
    await expect(searchBox.searchInput).toHaveValue('test query');
  });
});
