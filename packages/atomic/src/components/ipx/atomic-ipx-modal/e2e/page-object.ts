import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicIpxModalPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-ipx-modal');
  }

  get backdrop() {
    return this.hydrated.locator('[part="backdrop"]');
  }
}
