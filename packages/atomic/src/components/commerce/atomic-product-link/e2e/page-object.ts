import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ProductLinkPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-product-link');
  }

  anchor() {
    // Scope the link lookup to the component to avoid matching global overlays
    // (e.g. the Storybook "Edit in GitHub" link) which also use <a>.
    return this.page.locator(`${this.tag}`).getByRole('link');
  }
}
