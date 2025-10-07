import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicSearchInterfacePageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-search-interface');
  }

  getFacetValue(value: string | RegExp) {
    return this.page.getByRole('listitem').filter({hasText: value});
  }

  interface() {
    return this.page.locator('atomic-search-interface');
  }

  searchBox() {
    return this.page.locator('atomic-search-box');
  }

  getBreadcrumbButtons(value?: string | RegExp) {
    const baseLocator = this.page.locator('[part="breadcrumb-button"]:visible');
    return value ? baseLocator.filter({hasText: value}) : baseLocator;
  }
}
