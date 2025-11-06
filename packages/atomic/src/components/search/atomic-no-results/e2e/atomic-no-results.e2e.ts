import {expect, test} from './fixture';

test.describe('atomic-no-results', () => {
  test.beforeEach(async ({noResults}) => {
    await noResults.load();
    await noResults.hydrated.waitFor();
  });

  test('should be present in the page', async ({noResults}) => {
    await expect(noResults.ariaLive()).toBeVisible();
  });

  test('should display no results message', async ({noResults}) => {
    await expect(noResults.message()).toBeVisible();
  });

  test('should display search tips', async ({noResults}) => {
    await expect(noResults.searchTips()).toBeVisible();
  });

  test.describe('when the query contains HTML characters', () => {
    test.beforeEach(async ({searchBox}) => {
      await searchBox.hydrated.waitFor();
      await searchBox.searchInput.fill('<div>$@#()-^!query</div>');
      await searchBox.submitButton.click();
    });

    test('should display the query with HTML characters', async ({
      noResults,
    }) => {
      await expect(noResults.message('<div>$@#()-^!query</div>')).toBeVisible();
    });
  });
});
