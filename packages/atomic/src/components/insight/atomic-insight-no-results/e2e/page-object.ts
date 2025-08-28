import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicInsightNoResultsPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-no-results');
  }
}
