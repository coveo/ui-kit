import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class IpxRefineTogglePageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-ipx-refine-toggle');
  }

  get button() {
    return this.page.locator('atomic-ipx-refine-toggle').getByRole('button');
  }

  get badge() {
    return this.page.locator(
      'atomic-ipx-refine-toggle [part="ipx-refine-toggle-badge"]'
    );
  }

  get icon() {
    return this.page.locator(
      'atomic-ipx-refine-toggle [part="ipx-refine-toggle-icon"]'
    );
  }

  async clickButton() {
    await this.button.click();
  }
}
