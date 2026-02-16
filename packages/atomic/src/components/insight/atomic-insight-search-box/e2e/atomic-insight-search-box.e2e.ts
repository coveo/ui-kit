import {expect, test} from './fixture';

test.describe('atomic-insight-search-box', () => {
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
