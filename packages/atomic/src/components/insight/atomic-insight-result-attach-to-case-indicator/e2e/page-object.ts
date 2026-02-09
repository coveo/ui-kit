import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicInsightResultAttachToCaseIndicatorPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-result-attach-to-case-indicator');
  }

  get icon() {
    return this.page.locator('[part="icon"]');
  }

  get resultList() {
    return this.page.locator('atomic-insight-result-list');
  }

  get results() {
    return this.page.locator('atomic-insight-result');
  }
}
