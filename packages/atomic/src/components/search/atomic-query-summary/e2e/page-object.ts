import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicQuerySummaryPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-query-summary');
  }
}
