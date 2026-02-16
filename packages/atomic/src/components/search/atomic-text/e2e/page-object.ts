import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicText extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-text');
  }

  get getText() {
    return this.page.locator('atomic-text');
  }
}
