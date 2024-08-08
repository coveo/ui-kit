/* eslint-disable @cspell/spellchecker */
import {test, expect} from './fixture';

test.describe('when there are results', () => {
  test.beforeEach(async ({noProducts}) => {
    await noProducts.load({story: 'with-results'});
  });

  test('should have aria live before first query', async ({noProducts}) => {
    await expect(noProducts.ariaLive()).toBeVisible();
  });

  test.describe('after executing a search query that yields no results', () => {
    test.beforeEach(async ({searchBox}) => {
      await searchBox.noProducts();
      await searchBox.hydrated.waitFor();
      await searchBox.searchInput.fill('gahaiusdhgaiuewjfsf');
      await searchBox.submitButton.click();
    });

    test('should have aria live', async ({noProducts}) => {
      await expect(noProducts.ariaLive('gahaiusdhgaiuewjfsf')).toBeVisible();
    });

    test('should display no result message', async ({noProducts}) => {
      await expect(noProducts.message('gahaiusdhgaiuewjfsf')).toBeVisible();
    });
  });

  test.describe('after executing a search query that returns results', () => {
    test.beforeEach(async ({searchBox}) => {
      await searchBox.hydrated.waitFor();
      await searchBox.searchInput.fill('kayak');
      await searchBox.submitButton.click();
    });

    test('should remove aria live', async ({noProducts}) => {
      await expect(noProducts.ariaLive()).not.toBeVisible();
      await expect(noProducts.ariaLive('kayak')).not.toBeVisible();
    });

    test('should remove no result message', async ({noProducts}) => {
      await expect(noProducts.message()).not.toBeVisible();
    });
  });
});

test.describe('when there are no products', () => {
  test.beforeEach(async ({noProducts}) => {
    await noProducts.noProducts();
    await noProducts.load({story: 'default'});
    await expect(noProducts.hydrated).toBeVisible();
  });

  test('should be present in the page', async ({noProducts}) => {
    await expect(noProducts.ariaLive()).toBeVisible();
  });

  test('should display no result message', async ({noProducts}) => {
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
