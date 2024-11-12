import {Locator, Page} from '@playwright/test';

export class CartPageObject {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async getCart() {
    return this.page.locator('div:has(> button:has-text("Purchase"))');
  }

  async getItems() {
    const cart = await this.getCart();
    return cart.locator('ul > li');
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

  async getAddToCartButton() {
    return this.page.getByRole('button', {name: 'Add to cart'});
  }

  async getAddOneButton() {
    return this.page.getByRole('button', {name: 'Add one'});
  }

  async getRemoveOneButton() {
    return this.page.getByRole('button', {name: 'Remove one'});
  }

  async getRemoveAllButton() {
    return this.page.getByRole('button', {name: 'Remove all'});
  }

  async getPurchaseButton() {
    return this.page.getByRole('button', {name: 'Purchase'});
  }

  async getEmptyCartButton() {
    return this.page.getByRole('button', {name: 'Empty cart'});
  }

  async getTotal() {
    return (await this.getCart()).locator('p').last().locator('span').nth(2);
  }
}
