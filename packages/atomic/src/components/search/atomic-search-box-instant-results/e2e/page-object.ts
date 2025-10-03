import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicSearchBoxInstantResultsPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-search-box-instant-results');
  }
}
