import {BasePageObject} from '@/playwright-utils/base-page-object';
import type {Page} from '@playwright/test';

export class AtomicResultListPageObject extends BasePageObject<'atomic-result-list'> {
  constructor(page: Page) {
    super(page, 'atomic-result-list');
  }
}
