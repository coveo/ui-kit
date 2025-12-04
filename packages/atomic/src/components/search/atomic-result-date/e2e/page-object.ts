import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ResultDatePageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-result-date');
  }

  get dateContent() {
    return this.page.locator('atomic-result-date');
  }
}
