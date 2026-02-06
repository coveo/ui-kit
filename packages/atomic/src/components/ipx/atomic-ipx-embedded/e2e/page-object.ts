import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class IpxEmbeddedPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-ipx-embedded');
  }

  get backdrop() {
    return this.hydrated.locator('[part="backdrop"]');
  }

  get container() {
    return this.hydrated.locator('[part="container"]');
  }

  get headerSlot() {
    return this.page.locator('atomic-ipx-embedded [slot="header"]');
  }

  get bodySlot() {
    return this.page.locator('atomic-ipx-embedded [slot="body"]');
  }

  get footerSlot() {
    return this.page.locator('atomic-ipx-embedded [slot="footer"]');
  }
}
