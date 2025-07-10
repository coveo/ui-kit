import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class IconPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-icon');
  }

  get svg() {
    return this.hydrated.locator('svg');
  }
}
