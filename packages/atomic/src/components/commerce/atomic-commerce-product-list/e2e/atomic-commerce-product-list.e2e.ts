import {test, expect} from './fixture';

test.describe('when no first search has yet been executed', async () => {
  test.beforeEach(async ({productList}) => {
    await productList.load();
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

  test('should open product in the same tab by default', async ({
    page,
    productList,
  }) => {
    const expectedUrl = /sports\.barca\.group\/pdp\/.*$/;
    await productList.products.first().click();
    await page.waitForURL(expectedUrl);
    expect(page.url()).toMatch(expectedUrl);
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
    await productList.hydrated.waitFor();
  });

  test('should not display placeholders', async ({productList}) => {
    await expect(productList.placeholders.first()).not.toBeVisible();
    await expect(productList.placeholders.nth(23)).not.toBeVisible();
  });
});

test.describe('when gridCellLinkTarget is set to _blank', async () => {
  test.beforeEach(async ({productList}) => {
    await productList.load({story: 'open-in-new-tab'});
    await productList.hydrated.waitFor();
  });

  test('should open product in new tab', async ({context, productList}) => {
    const [newTab] = await Promise.all([
      context.waitForEvent('page'),
      productList.products.first().click(),
    ]);
    await newTab.waitForLoadState();

    expect(newTab.url()).toMatch(/sports\.barca\.group\/pdp\/.*$/);
  });
});

// TODO: KIT-3247 add the rest of E2E tests
