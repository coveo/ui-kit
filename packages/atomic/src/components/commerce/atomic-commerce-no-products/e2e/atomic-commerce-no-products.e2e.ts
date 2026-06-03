import {expect, test} from './fixture';

test.describe('atomic-commerce-no-products', () => {
  test.beforeEach(async ({noProducts}) => {
    await noProducts.load();
    await noProducts.hydrated.waitFor();
  });

  test('should be present in the page', async ({noProducts}) => {
    await expect(noProducts.ariaLive()).toBeVisible();
  });

  test('should display no products message', async ({noProducts}) => {
    await expect(noProducts.message()).toBeVisible();
  });

  test('should display search tips', async ({noProducts}) => {
    await expect(noProducts.searchTips()).toBeVisible();
  });

  test.describe('when the query contains HTML characters', () => {
    test.beforeEach(async ({searchBox}) => {
      await searchBox.hydrated.waitFor();
      await searchBox.searchInput.fill('<div>$@#()-^!query</div>');
      await searchBox.submitButton.click();
    });

    test('should display the query with HTML characters', async ({
      noProducts,
    }) => {
      await expect(
        noProducts.message('<div>$@#()-^!query</div>')
      ).toBeVisible();
    });
  });
});
