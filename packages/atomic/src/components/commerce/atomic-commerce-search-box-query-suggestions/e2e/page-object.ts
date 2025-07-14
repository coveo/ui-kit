import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicCommerceSearchBoxQuerySuggestionsPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-search-box-query-suggestions');
  }

  get suggestion() {
    return this.page.getByLabel(' suggested query.');
  }

  get loader() {
    return this.page.locator('[part="loading"]');
  }

  get searchBox() {
    return this.page.getByPlaceholder('Search');
  }

  get replicatedValue() {
    return this.page.locator('[part="textarea-expander"]');
  }
}
