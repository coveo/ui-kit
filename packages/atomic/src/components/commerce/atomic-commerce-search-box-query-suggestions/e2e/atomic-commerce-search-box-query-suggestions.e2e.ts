import {expect, test} from './fixture';

test.describe('atomic-commerce-search-box-query-suggestions', () => {
  test.beforeEach(async ({commerceSearchBoxQuerySuggestions, page}) => {
    await commerceSearchBoxQuerySuggestions.load();
    await page.locator('atomic-commerce-search-box').waitFor();
  });

  test('when clicking a suggestion, it should hide the suggestions', async ({
    commerceSearchBoxQuerySuggestions,
  }) => {
    await commerceSearchBoxQuerySuggestions.suggestion.first().click();
    await expect(
      commerceSearchBoxQuerySuggestions.suggestion.first()
    ).not.toBeVisible();
  });

  test.describe('when hovering a suggestion', () => {
    test('should change the activeDescendant of the search box', async ({
      commerceSearchBoxQuerySuggestions,
    }) => {
      await expect(commerceSearchBoxQuerySuggestions.searchBox).toHaveAttribute(
        'aria-activedescendant',
        ''
      );

      await commerceSearchBoxQuerySuggestions.suggestion.first().hover();

      await expect(commerceSearchBoxQuerySuggestions.searchBox).toHaveAttribute(
        'aria-activedescendant',
        /atomic-commerce-search-box-.*-suggestion-.*/
      );
    });

    test('should not change the query in the search box', async ({
      commerceSearchBoxQuerySuggestions,
    }) => {
      await expect(
        commerceSearchBoxQuerySuggestions.replicatedValue
      ).toHaveAttribute('data-replicated-value', '');

      await commerceSearchBoxQuerySuggestions.suggestion.first().hover();

      await expect(commerceSearchBoxQuerySuggestions.searchBox).toHaveValue('');
    });
  });

  test.describe('when using the keyboard', () => {
    test('should change the activeDescendant of the search box', async ({
      commerceSearchBoxQuerySuggestions,
    }) => {
      await expect(commerceSearchBoxQuerySuggestions.searchBox).toHaveAttribute(
        'aria-activedescendant',
        ''
      );

      await expect(
        commerceSearchBoxQuerySuggestions.suggestion.first()
      ).toBeVisible();
      await commerceSearchBoxQuerySuggestions.searchBox.press('ArrowDown');

      await expect(commerceSearchBoxQuerySuggestions.searchBox).toHaveAttribute(
        'aria-activedescendant',
        /atomic-commerce-search-box-.*-suggestion-.*/
      );
    });

    test('should change the query in the search box', async ({
      commerceSearchBoxQuerySuggestions,
    }) => {
      await expect(
        commerceSearchBoxQuerySuggestions.suggestion.first()
      ).toBeVisible();

      await commerceSearchBoxQuerySuggestions.searchBox.press('ArrowDown');

      await expect(commerceSearchBoxQuerySuggestions.searchBox).not.toHaveValue(
        ''
      );
    });

    test('when pressing enter, it should hide the suggestions', async ({
      commerceSearchBoxQuerySuggestions,
    }) => {
      await expect(
        commerceSearchBoxQuerySuggestions.suggestion.first()
      ).toBeVisible();
      await commerceSearchBoxQuerySuggestions.searchBox.press('ArrowDown');

      await commerceSearchBoxQuerySuggestions.searchBox.press('Enter');

      await expect(
        commerceSearchBoxQuerySuggestions.suggestion.first()
      ).not.toBeVisible();
    });
  });
});
