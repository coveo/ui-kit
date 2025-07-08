import {BasePageObject} from '@/playwright-utils/lit-base-page-object';
import type {Page} from '@playwright/test';

export class LoadMoreProductsPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-load-more-products');
  }

  get hydrated() {
    return this.page.locator(`${this.tag}`);
  }

  get button() {
    return this.page.locator('[part="load-more-results-button"]');
  }

  get showingResults() {
    return this.page.locator('[part="showing-results"]');
  }
}
