import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class InstantProductPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-search-box-instant-products');
  }

  get instantProducts() {
    return this.page.getByLabel('instant product');
  }

  get productRoots() {
    return this.page.locator('.result-root');
  }

  get showAllButton() {
    return this.page.getByLabel('See all products');
  }
}
