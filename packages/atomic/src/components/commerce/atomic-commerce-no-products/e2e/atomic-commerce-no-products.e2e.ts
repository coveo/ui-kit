import {test, expect} from './fixture';

test.describe('when there are results', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-no-products--with-results&viewMode=story'
    );
  });

  test('should not be visible', async ({noProducts}) => {
    await expect(noProducts.ariaLive()).not.toBeVisible();
  });

  test.describe('after executing a search query that yields no results', () => {
    test.beforeEach(async ({searchBox}) => {
      await searchBox.hydrated.waitFor();
      // eslint-disable-next-line @cspell/spellchecker
      await searchBox.searchInput.fill('gahaiusdhgaiuewjfsf');
      await searchBox.submitButton.click();
    });

    test('should have aria live', async ({noProducts}) => {
      // eslint-disable-next-line @cspell/spellchecker
      await expect(noProducts.ariaLive('gahaiusdhgaiuewjfsf')).toBeVisible();
    });

    test('should display no result message', async ({noProducts}) => {
      // eslint-disable-next-line @cspell/spellchecker
      await expect(noProducts.message('gahaiusdhgaiuewjfsf')).toBeVisible();
    });
  });

  test.describe('after executing a search query that returns results', () => {
    test.beforeEach(async ({page, searchBox}) => {
      await searchBox.hydrated.waitFor();
      await page.getByPlaceholder('Search').fill('kayak');
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

test.describe('when there are no results', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-no-products--default&viewMode=story'
    );
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
