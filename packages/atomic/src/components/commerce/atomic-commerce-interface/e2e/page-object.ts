import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicCommerceInterfacePageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-interface');
  }

  getFacetValue(value: string | RegExp) {
    return this.page.getByRole('listitem').filter({hasText: value});
  }

  interface() {
    return this.page.locator('atomic-commerce-interface');
  }

  searchBox() {
    return this.page.locator('atomic-commerce-search-box');
  }

  getBreadcrumbButtons(value?: string | RegExp) {
    const baseLocator = this.page.locator('[part="breadcrumb-button"]:visible');
    return value ? baseLocator.filter({hasText: value}) : baseLocator;
  }
}
