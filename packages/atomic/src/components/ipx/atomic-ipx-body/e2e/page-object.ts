import type {Locator, Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class IpxBodyPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-ipx-body');
  }

  get container(): Locator {
    return this.page.locator('atomic-ipx-body [part="container"]');
  }

  get headerWrapper(): Locator {
    return this.page.locator('atomic-ipx-body [part="header-wrapper"]');
  }

  get header(): Locator {
    return this.page.locator('atomic-ipx-body [part="header"]');
  }

  get headerRuler(): Locator {
    return this.page.locator('atomic-ipx-body [part="header-ruler"]');
  }

  get bodyWrapper(): Locator {
    return this.page.locator('atomic-ipx-body [part="body-wrapper"]');
  }

  get body(): Locator {
    return this.page.locator('atomic-ipx-body [part="body"]');
  }

  get footerWrapper(): Locator {
    return this.page.locator('atomic-ipx-body [part="footer-wrapper"]');
  }

  get footer(): Locator {
    return this.page.locator('atomic-ipx-body [part="footer"]');
  }

  get headerSlot(): Locator {
    return this.page.locator('atomic-ipx-body [slot="header"]');
  }

  get bodySlot(): Locator {
    return this.page.locator('atomic-ipx-body [slot="body"]');
  }

  get footerSlot(): Locator {
    return this.page.locator('atomic-ipx-body [slot="footer"]');
  }
}
