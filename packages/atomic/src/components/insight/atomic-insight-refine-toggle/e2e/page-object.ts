import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class RefineTogglePageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-refine-toggle');
  }

  get button() {
    return this.page.getByRole('button', {name: 'Filters'});
  }

  get badge() {
    return this.page.locator('[part="insight-refine-toggle-badge"]');
  }

  get icon() {
    return this.page.locator('[part="insight-refine-toggle-icon"]');
  }

  get modal() {
    return this.page.getByRole('dialog', {name: 'Filters'});
  }
}
