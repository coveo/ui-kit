import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class ResultIconPageObject extends BasePageObject<'atomic-result-icon'> {
  constructor(page: Page) {
    super(page, 'atomic-result-icon');
  }

  get svg() {
    return this.hydrated.locator('svg');
  }
}
