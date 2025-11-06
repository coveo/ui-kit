import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class LoadMoreResultsPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-load-more-results');
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
