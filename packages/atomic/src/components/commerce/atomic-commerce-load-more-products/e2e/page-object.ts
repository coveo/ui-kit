import type {Page} from '@playwright/test';

export class AtomicCommerceLoadMoreProductsLocators {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  summary({index, total}: {index?: number; total?: number} = {}) {
    return this.page.getByText(
      new RegExp(`Showing ${index ?? '\\d+'} of ${total ?? '\\d+'} result`)
    );
  }

  get hydrated() {
    return this.page.locator(
      'atomic-commerce-load-more-products[class*="hydrated"]'
    );
  }

  get button() {
    return this.page.getByText('Load more results');
  }

  get progressBar() {
    return this.page.locator('[part="progress-bar"]');
  }

  get progressValue() {
    return this.page.locator('[part="progress-bar"] > div');
  }
}
