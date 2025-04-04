import {BasePageObject} from '@/playwright-utils/lit-base-page-object';
import {Page} from '@playwright/test';

export class IconPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-icon');
  }

  get svg() {
    return this.hydrated.locator('svg');
  }
}
