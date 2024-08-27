import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../playwright-utils/base-page-object';

export class QuerySummaryPageObject extends BasePageObject<'atomic-commerce-query-summary'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-query-summary');
  }

  get placeholder() {
    return this.page.locator('[part="placeholder"]');
  }

  ariaLive(textRegex: RegExp) {
    return this.page.getByRole('status').filter({hasText: textRegex});
  }

  text(summaryRegex: RegExp) {
    return this.page
      .locator(':not([role="status"])')
      .filter({hasText: summaryRegex});
  }

  get container() {
    return this.page.locator('[part="container"]');
  }
}
