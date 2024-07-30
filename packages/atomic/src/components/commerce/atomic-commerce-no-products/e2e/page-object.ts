import {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../playwright-utils/base-page-object';

export class NoProductsPageObject extends BasePageObject<'atomic-commerce-no-products'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-no-products');
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
