import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class NotificationsPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-notifications');
  }

  notification(index: number = 0) {
    return this.page
      .locator('atomic-notifications [part="notification"]')
      .nth(index);
  }
}
