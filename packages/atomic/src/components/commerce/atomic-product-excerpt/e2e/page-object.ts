import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ProductExcerptPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-product-excerpt');
  }

  get textContent() {
    return this.page.locator('.expandable-text');
  }

  get showMoreButton() {
    return this.page.getByRole('button', {name: 'Show more'});
  }
}
