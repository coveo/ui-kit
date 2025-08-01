import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ProductDescriptionPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-product-description');
  }

  get textContent() {
    return this.page.locator('.expandable-text');
  }

  get highlightedText() {
    return this.page.locator('atomic-product-text b');
  }

  get showMoreButton() {
    return this.page.getByRole('button', {name: 'Show more'});
  }
}
