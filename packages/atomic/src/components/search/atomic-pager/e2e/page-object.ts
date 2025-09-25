import type {Locator, Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class PagerPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-pager');
  }

  get previousButton(): Locator {
    return this.page.locator('atomic-pager button[aria-label="Previous"]');
  }

  get nextButton(): Locator {
    return this.page.locator('atomic-pager button[aria-label="Next"]');
  }

  get pageButtons(): Locator {
    return this.page.locator('atomic-pager button[part*="page-button"]');
  }

  pageButton(pageNumber: number): Locator {
    return this.page.locator(
      `atomic-pager button[aria-label="Page ${pageNumber}"]`
    );
  }

  get previousButtonIcon(): Locator {
    return this.page.locator('atomic-pager [part="previous-button-icon"]');
  }

  get nextButtonIcon(): Locator {
    return this.page.locator('atomic-pager [part="next-button-icon"]');
  }
}
