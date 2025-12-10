import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class NotificationsPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-notifications');
  }

  notifications() {
    return this.page.locator('atomic-notifications [part="notifications"]');
  }

  notification(index: number = 0) {
    return this.page
      .locator('atomic-notifications [part="notification"]')
      .nth(index);
  }

  notificationText(index: number = 0) {
    return this.notification(index).locator('[part="text"]');
  }

  notificationIcon(index: number = 0) {
    return this.notification(index).locator('[part="icon"]');
  }

  ariaLive() {
    return this.page.getByRole('status');
  }
}
