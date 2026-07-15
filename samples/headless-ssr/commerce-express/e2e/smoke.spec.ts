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

test.describe('search box suggestions and instant products', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/search');
    await expect(page.locator('#search-input')).toBeVisible();
  });

  // Note: query suggestions and instant products are fetched on the client as
  // the user types. Like the Next.js reference sample, these assertions check
  // structure and behavior rather than specific suggestion/product text.

  test('shows query suggestions as the user types', async ({page}) => {
    await page.locator('#search-input').fill('surf');

    const dropdown = page.locator('#search-dropdown');
    await expect(dropdown).toBeVisible();

    const suggestions = dropdown.getByRole('option');
    await expect(suggestions.first()).toBeVisible();
    expect(await suggestions.count()).toBeGreaterThanOrEqual(1);
  });

  test('shows instant products alongside the suggestions', async ({page}) => {
    await page.locator('#search-input').fill('surf');

    const instantProducts = page.locator('.InstantProducts .InstantProduct');
    await expect(instantProducts.first()).toBeVisible();
    expect(await instantProducts.count()).toBeGreaterThanOrEqual(1);
    // Each tile shows a product name.
    await expect(page.locator('.InstantProductName').first()).not.toBeEmpty();
  });

  test('selects a suggestion to run a search', async ({page}) => {
    await page.locator('#search-input').fill('surf');
    const dropdown = page.locator('#search-dropdown');
    await expect(dropdown.getByRole('option').first()).toBeVisible();

    const firstSuggestion = dropdown.getByRole('option').first();
    const suggestionText = ((await firstSuggestion.textContent()) ?? '').trim();
    await firstSuggestion.click();

    // Selecting a suggestion fills the box with it, runs a search, and closes.
    await expect(page).toHaveURL(/[?&]q=/);
    await expect(dropdown).toBeHidden();
    await expect(page.locator('#search-input')).toHaveValue(suggestionText);
  });

  test('navigates suggestions with the keyboard and searches on Enter', async ({
    page,
  }) => {
    const input = page.locator('#search-input');
    await input.fill('surf');
    await expect(
      page.locator('#search-dropdown').getByRole('option').first()
    ).toBeVisible();

    await input.press('ArrowDown');
    await expect(page.locator('.Suggestion[aria-selected="true"]')).toHaveCount(
      1
    );

    await input.press('Enter');
    await expect(page).toHaveURL(/[?&]q=/);
    await expect(page.locator('#search-dropdown')).toBeHidden();
  });

  test('closes the dropdown on Escape', async ({page}) => {
    const input = page.locator('#search-input');
    await input.fill('surf');
    await expect(page.locator('#search-dropdown')).toBeVisible();

    await input.press('Escape');
    await expect(page.locator('#search-dropdown')).toBeHidden();
    // Escape keeps the typed query.
    await expect(input).toHaveValue('surf');
  });

  test('closes the dropdown when clicking outside', async ({page}) => {
    await page.locator('#search-input').fill('surf');
    await expect(page.locator('#search-dropdown')).toBeVisible();

    // The app title is a non-interactive element outside the search box.
    await page.locator('.AppTitle').click();
    await expect(page.locator('#search-dropdown')).toBeHidden();
  });

  test('clears the query with the clear button', async ({page}) => {
    const input = page.locator('#search-input');
    await input.fill('surf');

    const clear = page.locator('#search-clear');
    await expect(clear).toBeVisible();
    await clear.click();

    await expect(input).toHaveValue('');
    await expect(page.locator('#search-dropdown')).toBeHidden();
    await expect(clear).toBeHidden();
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

test.describe('cart', () => {
  test.beforeEach(async ({page}) => {
    // Start each test from a clean cart so runs are independent.
    await page.context().clearCookies();
    await page.goto('/search');
    await expect(page.locator('.ProductCard').first()).toBeVisible();
  });

  test('shows the cart toggle with the badge hidden when empty', async ({
    page,
  }) => {
    await expect(page.locator('#cart-toggle')).toBeVisible();
    await expect(page.locator('#cart-count')).toBeHidden();
    await expect(page.locator('#cart-drawer')).toBeHidden();
  });

  test('adds a product to the cart and updates the badge and button', async ({
    page,
  }) => {
    const firstAddToCart = page.locator('.ProductCard .AddToCart').first();
    await firstAddToCart.click();

    await expect(page.locator('#cart-count')).toBeVisible();
    await expect(page.locator('#cart-count')).toHaveText('1');
    await expect(firstAddToCart).toContainText('(1)');
  });

  test('opens the drawer and lists the added item', async ({page}) => {
    await page.locator('.ProductCard .AddToCart').first().click();
    await page.locator('#cart-toggle').click();

    await expect(page.locator('#cart-drawer')).toBeVisible();
    await expect(page.locator('#cart-body .CartItem')).toHaveCount(1);
    await expect(page.locator('#cart-purchase')).toBeVisible();
    await expect(page.locator('#cart-empty')).toBeVisible();
  });

  test('adjusts item quantity from the drawer', async ({page}) => {
    await page.locator('.ProductCard .AddToCart').first().click();
    await page.locator('#cart-toggle').click();

    const item = page.locator('#cart-body .CartItem').first();
    await item.locator('.CartQtyButton[data-action="increment"]').click();
    await expect(item.locator('.CartItemQty')).toHaveText('2');
    await expect(page.locator('#cart-count')).toHaveText('2');

    await item.locator('.CartQtyButton[data-action="decrement"]').click();
    await expect(item.locator('.CartItemQty')).toHaveText('1');
    await expect(page.locator('#cart-count')).toHaveText('1');
  });

  test('removes an item and empties the cart', async ({page}) => {
    await page.locator('.ProductCard .AddToCart').first().click();
    await page.locator('#cart-toggle').click();
    await expect(page.locator('#cart-body .CartItem')).toHaveCount(1);

    await page.locator('#cart-empty').click();

    await expect(page.locator('#cart-body')).toContainText(
      'Your cart is empty'
    );
    await expect(page.locator('#cart-count')).toBeHidden();
  });

  test('closes the drawer with the overlay', async ({page}) => {
    await page.locator('#cart-toggle').click();
    await expect(page.locator('#cart-drawer')).toBeVisible();

    await page.locator('#cart-overlay').click({position: {x: 5, y: 5}});
    await expect(page.locator('#cart-drawer')).toBeHidden();
  });

  test('persists the cart across navigation', async ({page}) => {
    await page.locator('.ProductCard .AddToCart').first().click();
    await expect(page.locator('#cart-count')).toHaveText('1');

    // The cart is seeded from the cookie on the server for the next page.
    await page.goto('/listing/surf-accessories');
    await expect(page.locator('#cart-count')).toBeVisible();
    await expect(page.locator('#cart-count')).toHaveText('1');
  });
});
