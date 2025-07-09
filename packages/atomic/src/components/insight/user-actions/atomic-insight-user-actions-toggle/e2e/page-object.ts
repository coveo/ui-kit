import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class UserActionsTogglePageObject extends BasePageObject<'atomic-insight-user-actions-toggle'> {
  constructor(page: Page) {
    super(page, 'atomic-insight-user-actions-toggle');
  }

  get atomicInsightHistoryToggle() {
    return this.page.locator('button[title="User actions"]');
  }

  get atomicInsightUserActionsTimeline() {
    return this.page.locator('atomic-insight-user-actions-timeline');
  }
}
