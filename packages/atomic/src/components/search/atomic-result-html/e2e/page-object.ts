import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ResultHtmlPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-result-html');
  }

  get htmlContent() {
    return this.page.locator('atomic-result-html atomic-html');
  }
}
