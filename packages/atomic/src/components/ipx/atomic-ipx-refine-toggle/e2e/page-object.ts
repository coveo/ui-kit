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

  get modal() {
    return this.page.locator('atomic-ipx-refine-modal');
  }

  get modalExpandFacetButton() {
    return this.modal
      .getByRole('button', {name: /Expand the .* facet/})
      .first();
  }

  get modalFirstCheckbox() {
    return this.modal.getByRole('checkbox').first();
  }

  async clickButton() {
    await this.button.click();
  }
}
