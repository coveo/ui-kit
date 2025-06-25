import {testStandaloneSearchBox as test, expect} from './fixture';

const variants = [
  {variantName: 'default', isTextArea: false},
  {variantName: 'expandable', isTextArea: true},
];

test.describe('quantic-standalone-search-box', () => {
  variants.forEach(({variantName, isTextArea}) => {
    test.describe(`variant ${variantName} with default options`, () => {
      test.use({
        options: {
          textarea: isTextArea,
        },
      });

      test('should display suggestions and redirect on click', async ({
        searchBox,
        page,
        querySuggest,
      }) => {
        querySuggest.mockQuerySuggestResponse(['test', 'test 2']);

        const searchInputElement = searchBox.getSearchInputElement(isTextArea);
        await expect(searchInputElement).toBeVisible();
        await expect(searchBox.searchButton).toBeVisible();
        await expect(searchInputElement).toHaveAttribute(
          'placeholder',
          'Search'
        );
        await expect(searchBox.searchBoxInput).toHaveAttribute(
          'is-initialized',
          'true'
        );
        await searchInputElement.focus();

        await expect(searchBox.suggestionsList).toBeVisible();
        await expect((await searchBox.suggestions.all()).length).toBe(2);

        await searchBox.suggestions.first().click();
        await expect(page).toHaveURL(/\/global-search\/%40uri#q=test/);

        await page.goBack();
        const storage = await searchBox.getLocalStorageData();
        await expect(storage).toMatchObject({
          analytics: {
            cause: 'omniboxFromLink',
            metadata: {suggestions: ['test', 'test 2']},
          },
          value: 'test',
        });
      });

      test('should redirect on submitting query', async ({searchBox, page}) => {
        const query = 'another query';
        await searchBox.getSearchInputElement(isTextArea).fill(query);
        await expect(searchBox.clearButton).toBeVisible();
        await searchBox.searchButton.click();
        await expect(page).toHaveURL(
          new RegExp(`/global-search/%40uri#q=${encodeURIComponent(query)}`)
        );

        await page.goBack();
        const storage = await searchBox.getLocalStorageData();
        await expect(storage).toMatchObject({
          analytics: {cause: 'searchFromLink'},
          value: query,
        });
      });
    });
  });
});
