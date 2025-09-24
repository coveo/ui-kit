import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicSearchBoxQuerySuggestionsPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-search-box-query-suggestions');
  }

  get component() {
    return this.page.locator('atomic-search-box-query-suggestions');
  }

  get searchBox() {
    return this.page.locator('atomic-search-box');
  }
}
