import {BasePageObject} from '@/playwright-utils/lit-base-page-object';
import {Page} from '@playwright/test';

export class ProductTextPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-product-text');
  }

  get textContent() {
    return this.page.locator('atomic-product-text');
  }

  get highlightedText() {
    return this.page.locator('atomic-product-text b');
  }
}
