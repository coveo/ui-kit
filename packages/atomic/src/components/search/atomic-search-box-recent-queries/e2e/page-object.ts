import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicSearchBoxRecentQueriesPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-search-box-recent-queries');
  }

  get recentQuery() {
    return this.page.getByLabel(' recent query');
  }

  get clearButton() {
    return this.page.getByLabel('Clear recent searches.');
  }
}
