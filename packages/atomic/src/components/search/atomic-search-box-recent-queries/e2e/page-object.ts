import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicSearchBoxRecentQueriesPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-search-box-recent-queries');
  }

  get searchBox() {
    return this.page.locator('atomic-search-box');
  }

  get searchInput() {
    return this.searchBox.getByPlaceholder('Search');
  }

  recentQueries({index}: {index?: number} = {}) {
    const searchBox = this.page.locator('atomic-search-box');

    // Try different selector strategies:
    // 1. Look for parts within the search box
    return searchBox.locator('[part*="recent-query-item"]').or(
      // 2. Look for aria-labels with recent query pattern
      this.page
        .getByLabel(new RegExp(`recent query.*${index ?? '\\d+'}`))
        .or(
          // 3. Look for the basic recent query text pattern
          this.page
            .getByLabel(/, recent query$/)
            .or(
              // 4. Look for any element containing recent query text
              this.page.locator('[aria-label*="recent query"]')
            )
        )
    );
  }

  get recentQuery() {
    return this.recentQueries();
  }

  get clearButton() {
    const searchBox = this.page.locator('atomic-search-box');
    return searchBox
      .locator('[part*="recent-query-title-item"]')
      .or(
        this.page
          .getByLabel('Clear recent searches')
          .or(this.page.locator('[aria-label*="Clear recent searches"]'))
      );
  }
}
