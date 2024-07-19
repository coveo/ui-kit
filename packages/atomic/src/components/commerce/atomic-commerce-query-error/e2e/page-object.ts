import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../playwright-utils/base-page-object';

export class QueryErrorPageObject extends BasePageObject<'atomic-commerce-query-error'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-query-error');
  }

  get title() {
    return this.page.locator('[part="title"]');
  }
  get description() {
    return this.page.locator('[part="description"]');
  }
  get moreInfoButton() {
    return this.page.locator('[part="more-info-btn"]');
  }
  get moreInfoMessage() {
    return this.page.locator('[part="error-info"]');
  }
  get icon() {
    return this.page.locator('atomic-icon');
  }

  get ariaLive() {
    return this.page.locator('atomic-aria-live');
  }
}
