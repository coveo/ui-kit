import {BasePageObject} from '@/playwright-utils/base-page-object';
import type {Page} from '@playwright/test';
import {AtomicCommerceInterface} from '../atomic-commerce-interface';

export class CommerceInterfacePageObject extends BasePageObject<AtomicCommerceInterface> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-interface');
  }

  getFacetValue(value: string | RegExp) {
    return this.page.getByRole('listitem').filter({hasText: value});
  }

  interface() {
    return this.page.locator('atomic-commerce-interface');
  }

  getBreadcrumbButtons(value?: string | RegExp) {
    const baseLocator = this.page.locator('[part="breadcrumb-button"]:visible');
    return value ? baseLocator.filter({hasText: value}) : baseLocator;
  }
}
