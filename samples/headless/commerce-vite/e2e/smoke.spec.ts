import {expect, test} from './fixtures.js';

test('home page shows recommendations', async ({page}) => {
  await page.goto('/');
  await expect(page.locator('commerce-product-card').first()).toBeVisible();
});

test('search page shows products and facets', async ({page}) => {
  await page.goto('/#/search');
  await expect(
    page.locator('commerce-search-page .product').first()
  ).toBeVisible();
  await expect(
    page.locator('commerce-facet-list .facet').first()
  ).toBeVisible();
});

test('listing page shows products', async ({page}) => {
  await page.goto('/#/listing');
  await expect(
    page.locator('commerce-listing-page .product').first()
  ).toBeVisible();
});

test('cart: adding a product updates the tab and cart page', async ({page}) => {
  await page.goto('/#/listing');
  const addToCart = page
    .locator('commerce-product-card .cart-controls .add')
    .first();
  await addToCart.click();

  const cartTab = page.locator('nav a', {hasText: 'Cart'});
  await expect(cartTab).toContainText('Cart (1)');

  await cartTab.click();
  await expect(page.locator('commerce-cart-page .item').first()).toBeVisible();
});
