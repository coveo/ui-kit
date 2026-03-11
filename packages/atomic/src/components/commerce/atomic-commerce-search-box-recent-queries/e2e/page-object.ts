import type {Locator, Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicCommerceSearchBoxRecentQueriesPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-search-box-recent-queries');
  }

  get recentQuery() {
    return this.page.getByLabel(' recent query');
  }

  get clearButton() {
    return this.page.getByLabel('Clear recent searches.');
  }

  get ariaLiveRegion(): Locator {
    return this.page.locator('atomic-aria-live div[id*="search-box"]');
  }
}
