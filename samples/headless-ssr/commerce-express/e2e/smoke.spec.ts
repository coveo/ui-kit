import {expect, test} from './fixtures';

test.describe('commerce SSR search page', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/');
  });

  test('redirects / to /search', async ({page}) => {
    await expect(page).toHaveURL(/\/search/);
  });

  test('renders the branded header with logo and nav tabs', async ({page}) => {
    await expect(page.locator('.Header .HeaderLogo')).toBeVisible();
    const tabs = page.locator('.Tabs .Tab');
    expect(await tabs.count()).toBeGreaterThanOrEqual(4);
    await expect(page.locator('.Tab.TabActive')).toHaveText('Search');
  });

  test('server-renders the product list with products', async ({page}) => {
    await expect(page.locator('.ProductList')).toBeVisible();
    await expect(page.locator('.ProductCard').first()).toBeVisible();
  });

  test('renders the search box and results summary', async ({page}) => {
    await expect(page.locator('#search-input')).toBeVisible();
    await expect(page.locator('.Summary')).toBeVisible();
  });

  test('searches for products', async ({page}) => {
    await page.locator('#search-input').fill('bag');
    await page.locator('#search-button').click();

    await expect(page).toHaveURL(/q=bag/);
    await expect(page.locator('.ProductCard').first()).toBeVisible();
  });

  test('paginates through results', async ({page}) => {
    const pagination = page.locator('.Pagination');
    await expect(pagination).toBeVisible();
    await expect(pagination.locator('.SelectPage').first()).toBeVisible();

    await pagination.locator('.NextPage').click();
    await expect(pagination).toContainText('Page 2 of');
  });

  test('renders sort options', async ({page}) => {
    const select = page.locator('#sort-select');
    await expect(select).toBeVisible();
    expect(await select.locator('option').count()).toBeGreaterThanOrEqual(2);
  });

  test('renders facets and filters on selection', async ({page}) => {
    const facets = page.locator('.Facets');
    await expect(facets).toBeVisible();

    const firstValue = facets.locator('.FacetValueCheckbox').first();
    await expect(firstValue).toBeVisible();

    await firstValue.check();
    await expect(
      page.locator('.FacetValueCheckbox:checked').first()
    ).toBeVisible();
    await expect(page.locator('.ProductCard').first()).toBeVisible();
  });
});

test.describe('URL deep-linking', () => {
  test('hydrates without uncaught client errors', async ({page}) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('/search');
    // Exercise a hydration-driven interaction; a broken client bundle would
    // both throw here and fail to update the URL.
    await page.locator('.FacetValueCheckbox').first().check();
    await expect(page).toHaveURL(/[?&]f-/);

    expect(errors).toEqual([]);
  });

  test('server-renders a deep-linked query', async ({page}) => {
    await page.goto('/search?q=bag');
    await expect(page.locator('#search-input')).toHaveValue('bag');
    await expect(page.locator('.ProductCard').first()).toBeVisible();
  });

  test('reflects pagination in the URL', async ({page}) => {
    await page.goto('/search');
    await page.locator('.Pagination .NextPage').click();
    await expect(page).toHaveURL(/page=/);
  });

  test('reflects facet selection in the URL', async ({page}) => {
    await page.goto('/search');
    await page.locator('.FacetValueCheckbox').first().check();
    await expect(page).toHaveURL(/[?&]f-/);
  });
});

test.describe('product listing page', () => {
  test('server-renders a category listing with products and facets', async ({
    page,
  }) => {
    await page.goto('/listing/surf-accessories');

    await expect(page.locator('.Tab.TabActive')).toHaveText('Surf Accessories');
    await expect(page.locator('.ProductList')).toBeVisible();
    await expect(page.locator('.ProductCard').first()).toBeVisible();
    await expect(page.locator('.Facets')).toBeVisible();
  });

  test('returns 404 for an unknown listing', async ({page}) => {
    const response = await page.goto('/listing/does-not-exist');
    expect(response?.status()).toBe(404);
  });
});
