import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ResultLinkPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-result-link');
  }

  anchor() {
    return this.page.getByRole('link');
  }
}
