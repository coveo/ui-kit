import {BasePageObject} from '@/playwright-utils/lit-base-page-object';
import type {Page} from '@playwright/test';

export class AtomicLoadMoreItemsPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-load-more-items');
  }
}
