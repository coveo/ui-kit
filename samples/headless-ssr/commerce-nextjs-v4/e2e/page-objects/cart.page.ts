import type {Locator, Page} from '@playwright/test';

export class CartPageObject {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get cart() {
    return this.page.locator('div:has(> button:has-text("Purchase"))');
  }

  get items() {
    const cart = this.cart;
    return cart.locator('ul#cart > li');
  }

  async getItemQuantity(item: Locator) {
    return item.locator('p').nth(1).locator('span').nth(1);
  }

  async getItemPrice(item: Locator) {
    return item.locator('p').nth(2).locator('span').nth(2);
  }

  async getItemTotalPrice(item: Locator) {
    return item.locator('p').nth(3).locator('span').nth(2);
  }

  get addToCartButton() {
    return this.page.getByRole('button', {name: 'Add to cart'});
  }

  get addOneButton() {
    return this.page.getByRole('button', {name: 'Add one'});
  }

  get removeOneButton() {
    return this.page.getByRole('button', {name: 'Remove one'});
  }

  get removeAllButton() {
    return this.page.getByRole('button', {name: 'Remove all'});
  }

  get purchaseButton() {
    return this.page.getByRole('button', {name: 'Purchase'});
  }

  get emptyCartButton() {
    return this.page.getByRole('button', {name: 'Empty cart'});
  }

  get total() {
    return this.cart.locator('p').last().locator('span').nth(2);
  }
}
