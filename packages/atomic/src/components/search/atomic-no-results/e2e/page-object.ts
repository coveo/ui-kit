import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class NoResultsPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-no-results');
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
        ? `We couldn't find anything for "${query}"`
        : 'No results',
    });
  }

  cancelButton() {
    return this.page.locator('[part="cancel-button"]');
  }
}
