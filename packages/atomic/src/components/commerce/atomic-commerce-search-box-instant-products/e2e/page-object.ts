import {BasePageObject} from '@/playwright-utils/base-page-object';
import type {Page} from '@playwright/test';

export class InstantProductPageObject extends BasePageObject<'atomic-commerce-search-box-instant-products'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-search-box-instant-products');
  }

  get component() {
    return this.page.locator('atomic-commerce-search-box-instant-products');
  }

  get instantProducts() {
    return this.page.getByLabel('instant result');
  }

  get productRoots() {
    return this.page.locator('.result-root');
  }

  get showAllButton() {
    return this.page.getByLabel('See all results');
  }
}
