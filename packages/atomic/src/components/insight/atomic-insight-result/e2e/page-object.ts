import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicInsightResultPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-result');
  }
}
