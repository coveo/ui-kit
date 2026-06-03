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

  pageButton(pageNumber: number): Locator {
    return this.page.locator(
      `atomic-pager input[type="radio"][aria-label="Page ${pageNumber}"]`
    );
  }

  get currentPageButton(): Locator {
    return this.page.locator('atomic-pager input[type="radio"][checked]');
  }
}
