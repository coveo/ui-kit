import {test, expect} from './fixture';

test.describe('when no first search has yet been executed', async () => {
  test.beforeEach(async ({productList}) => {
    await productList.load({story: 'no-first-search'});
    await productList.hydrated.waitFor();
  });

  test('should display placeholders', async ({productList}) => {
    await expect(productList.placeholders.first()).toBeVisible();
  });

  test('should display the default amount of placeholders', async ({
    productList,
  }) => {
    await expect(productList.placeholders.nth(23)).toBeVisible();
  });
});

test.describe('when executing an initial search', () => {
  test.beforeEach(async ({productList, searchBox}) => {
    await productList.load({story: 'in-page'});
    await searchBox.searchInput.fill('pants');
    await searchBox.submitButton.click();
    await productList.hydrated.waitFor();
  });

  test('should not display placeholders', async ({productList}) => {
    await expect(productList.placeholders.first()).not.toBeVisible();
  });
});

test.describe('when interface load yields no products', () => {
  test.beforeEach(async ({productList}) => {
    await productList.load({story: 'no-results'});
  });

  test('should not display placeholders', async ({productList}) => {
    await expect(productList.placeholders.first()).not.toBeVisible();
    await expect(productList.placeholders.nth(23)).not.toBeVisible();
  });
});

// TODO: KIT-3247 add the rest of E2E tests
