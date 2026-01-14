import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicIpxModalPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-ipx-modal');
  }

  get backdrop() {
    return this.hydrated.locator('[part="backdrop"]');
  }

  get modalContainer() {
    return this.hydrated.locator('[part="atomic-ipx-modal"]');
  }

  get headerSlot() {
    return this.page.locator('atomic-ipx-modal [slot="header"]');
  }

  get bodySlot() {
    return this.page.locator('atomic-ipx-modal [slot="body"]');
  }

  get footerSlot() {
    return this.page.locator('atomic-ipx-modal [slot="footer"]');
  }
}
