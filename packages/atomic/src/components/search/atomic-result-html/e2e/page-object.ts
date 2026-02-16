import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicResultHtmlPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-result-html');
  }

  get htmlElement() {
    return this.hydrated.locator('atomic-html');
  }
}
