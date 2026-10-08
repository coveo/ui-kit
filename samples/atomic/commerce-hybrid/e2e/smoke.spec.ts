import type {Page, Request} from '@playwright/test';
import {cartStorageKey, expect, test} from './fixtures.js';

const cartItem = {productId: 'SP04946_00006', name: 'Chino khakis', price: 154, quantity: 1};

function seedCart(page: Page, items = [cartItem]) {
  return page.addInitScript(({key, value}) => window.localStorage.setItem(key, value), {
    key: cartStorageKey,
    value: JSON.stringify(items),
  });
}

function isAnalyticsEvent(type: string) {
  return (request: Request) =>
    request.url().includes('/events/v1') && (request.postData() ?? '').includes(`"${type}"`);
}

test('search page stays standard Atomic, extended with a Headless add-to-cart', async ({page}) => {
  await page.goto('/search.html');

  await expect(page.locator('atomic-commerce-search-box')).toBeVisible();
  await expect(page.locator('atomic-commerce-facets')).toBeVisible();
  await expect(page.locator('atomic-commerce-product-list')).toBeVisible();
  await expect(page.locator('atomic-commerce-pager')).toBeVisible();

  const miniCart = page.getByRole('link', {name: /^Cart, /});
  await expect(miniCart).toHaveAccessibleName('Cart, 0 items');

  const addToCart = page.getByRole('button', {name: /^Add .+ to cart$/}).first();
  const cartAction = page.waitForRequest(isAnalyticsEvent('ec.cartAction'));
  await addToCart.click();

  // The button sits inside an Atomic product card, which opens the product on any
  // click; the button must keep the shopper on the page.
  await expect(page).toHaveURL(/\/search\.html/);
  await expect(miniCart).toHaveAccessibleName('Cart, 1 item');
  await expect(addToCart).toContainText('(1 in cart)');
  await cartAction;
});

test('the cart survives a reload and is sent with Atomic requests', async ({page}) => {
  await seedCart(page);

  const searchRequest = page.waitForRequest(
    (request) => request.url().includes('/commerce/v2/search') && request.method() === 'POST'
  );
  await page.goto('/search.html');

  await expect(page.getByRole('link', {name: /^Cart, /})).toHaveAccessibleName('Cart, 1 item');
  expect((await searchRequest).postDataJSON().context.cart).toEqual([
    {productId: cartItem.productId, quantity: 1},
  ]);
});

test('a product card opens the product page', async ({page}) => {
  await page.goto('/search.html');

  const productLink = page
    .locator('atomic-commerce-product-list atomic-product')
    .first()
    .locator('atomic-product-section-name a');
  await expect(productLink).toHaveText(/\S/);

  const productView = page.waitForRequest(isAnalyticsEvent('ec.productView'));
  await productLink.click();

  await expect(page).toHaveURL(/\/product\.html\?id=/);
  // The product is handed over from the clicked card, so the page knows its name.
  const heading = page.getByRole('heading', {level: 2}).first();
  await expect(heading).not.toHaveText(/Loading|Product not found/);
  const name = (await heading.textContent())?.trim() ?? '';

  await expect(page.locator('product-badges')).toContainText('Best seller');
  await expect(page.getByRole('button', {name: `Add ${name} to cart`})).toBeVisible();
  await expect(
    page.locator('atomic-commerce-recommendation-list atomic-product').first()
  ).toBeVisible();
  await productView;
});

test('the cart page edits quantities and places the order', async ({page}) => {
  await seedCart(page);
  await page.goto('/cart.html');

  const cartView = page.locator('cart-view');
  await expect(cartView).toContainText(cartItem.name);
  await expect(cartView).toContainText('Total: $154.00');

  // Atomic recommendations on the cart slot are refreshed from Headless.
  const recommendationsRefresh = page.waitForRequest(
    (request) =>
      request.url().includes('/commerce/v2/recommendations') &&
      request.postDataJSON().context.cart?.[0]?.quantity === 2
  );
  await page.getByRole('button', {name: `Increase quantity of ${cartItem.name}`}).click();
  await expect(cartView).toContainText('Total: $308.00');
  await recommendationsRefresh;

  const purchase = page.waitForRequest(isAnalyticsEvent('ec.purchase'));
  await page.getByRole('button', {name: 'Place order'}).click();

  await expect(cartView).toContainText('Thank you, your order is placed.');
  await expect(page.getByRole('link', {name: /^Cart, /})).toHaveAccessibleName('Cart, 0 items');
  await purchase;
});

test('home page recommendations carry the Headless add-to-cart', async ({page}) => {
  await page.goto('/index.html');

  await expect(page.locator('atomic-commerce-recommendation-list')).toHaveCount(2);
  await expect(
    page
      .locator('atomic-commerce-recommendation-list')
      .first()
      .getByRole('button', {
        name: /^Add .+ to cart$/,
      })
      .first()
  ).toBeVisible();
});
