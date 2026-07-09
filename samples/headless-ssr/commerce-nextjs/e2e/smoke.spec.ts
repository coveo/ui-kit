import {expect, test} from './fixtures';

test.describe('product listing page', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/surf-accessories');
  });

  test('server-renders the product list with products', async ({page}) => {
    const productList = page.getByLabel('Product List');
    await expect(productList).toBeVisible();

    const products = productList.getByRole('listitem');
    await expect(products.first()).toBeVisible();
    expect(await products.count()).toBeGreaterThan(0);
  });

  test('renders the facets', async ({page}) => {
    await expect(page.locator('.Facets')).toBeVisible();
  });

  test('renders the results summary', async ({page}) => {
    await expect(page.getByText(/Showing results/)).toBeVisible();
  });

  test('shows cart-quantity feedback on the Add to cart button', async ({
    page,
  }) => {
    const addToCart = page.getByRole('button', {name: /^Add to cart/}).first();
    await addToCart.click();
    await expect(addToCart).toHaveText(/\(\d+\)/);
  });
});

test.describe('search page', () => {
  test('renders the search box', async ({page}) => {
    await page.goto('/search');
    await expect(page.getByRole('searchbox').first()).toBeVisible();
  });

  test('renders products for a query', async ({page}) => {
    await page.goto('/search');
    const searchBox = page.getByRole('searchbox').first();
    await searchBox.fill('bag');
    await searchBox.press('Enter');

    const productList = page.getByLabel('Product List');
    await expect(productList).toBeVisible();
    await expect(productList.getByRole('listitem').first()).toBeVisible();
  });
});
