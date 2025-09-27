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

  get searchInput() {
    return this.searchBox.getByPlaceholder('Search');
  }

  querySuggestions({index}: {index?: number} = {}) {
    const searchBox = this.page.locator('atomic-search-box');

    // Try different selector strategies:
    // 1. Look for parts within the search box
    return searchBox.locator('[part*="suggestion-item"]').or(
      // 2. Look for aria-labels with suggested query pattern
      this.page
        .getByLabel(new RegExp(`suggested query.*${index ?? '\\d+'}`))
        .or(
          // 3. Look for the basic suggestion text pattern
          this.page
            .getByLabel(/, suggested query$/)
            .or(
              // 4. Look for any element containing suggested query text
              this.page.locator('[aria-label*="suggested query"]')
            )
        )
    );
  }

  get querySuggestion() {
    return this.querySuggestions();
  }
}
