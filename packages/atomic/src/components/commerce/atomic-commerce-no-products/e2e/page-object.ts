import type {Page} from '@playwright/test';

export class AtomicCommerceNoProductsLocators {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  searchTips() {
    return this.page.locator('[part=search-tips]');
  }

  ariaLive(query?: string) {
    const text = query
      ? `We couldn't find anything for ${query}`
      : 'No results';

    return this.page.getByRole('status').filter({hasText: text});
  }

  message(query?: string) {
    return this.page.locator('[part="no-results"]', {
      hasText: query
        ? `We couldn't find anything for “${query}”`
        : 'No results',
    });
  }
}
