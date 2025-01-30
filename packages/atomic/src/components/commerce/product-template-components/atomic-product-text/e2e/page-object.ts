import {BasePageObject} from '@/playwright-utils/base-page-object';
import {Page} from '@playwright/test';

export class ProductTextPageObject extends BasePageObject<'atomic-product-text'> {
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
