import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class NoProductsPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-no-products');
  }

  searchTips() {
    return this.page.locator('[part=search-tips]');
  }

  ariaLive(query?: string) {
    const text = query
      ? `We couldn't find any product for ${query}`
      : 'No products';

    return this.page.getByRole('status').filter({hasText: text});
  }

  message(query?: string) {
    return this.page.locator('[part="no-results"]', {
      hasText: query
        ? `We couldn't find any product for “${query}”`
        : 'No products',
    });
  }
}
