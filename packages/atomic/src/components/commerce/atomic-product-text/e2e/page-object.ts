import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ProductTextPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-product-text');
  }

  get textContent() {
    return this.page.locator(
      'atomic-product-text:not(atomic-product-link atomic-product-text)'
    );
  }

  get highlightedText() {
    return this.page.locator(
      'atomic-product-text:not(atomic-product-link atomic-product-text) b'
    );
  }
}
