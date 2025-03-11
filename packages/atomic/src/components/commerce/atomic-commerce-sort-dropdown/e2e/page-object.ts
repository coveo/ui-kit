import {BasePageObject} from '@/playwright-utils/lit-base-page-object';
import type {Page} from '@playwright/test';

export class AtomicCommerceSortDropdownPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-sort-dropdown');
  }
}
