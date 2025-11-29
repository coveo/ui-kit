import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ResultPrintableUriPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-result-printable-uri');
  }

  get list() {
    return this.page.locator('atomic-result-printable-uri ul');
  }

  get links() {
    return this.page.locator('atomic-result-printable-uri a');
  }

  get ellipsisButton() {
    return this.page.locator('atomic-result-printable-uri button');
  }

  get separators() {
    return this.page.locator(
      'atomic-result-printable-uri .result-printable-uri-separator'
    );
  }
}
