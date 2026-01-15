import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class UserActionsSessionPageObject extends BasePageObject<'atomic-insight-user-actions-session'> {
  constructor(page: Page) {
    super(page, 'atomic-insight-user-actions-session');
  }

  get sessionStartDate() {
    return this.page.locator(
      'atomic-insight-user-actions-session .flex.items-center.px-2.pb-3'
    );
  }

  get sessionStartIcon() {
    return this.page.locator(
      'atomic-insight-user-actions-session [part="session-start-icon__container"]'
    );
  }

  get showMoreActionsButton() {
    return this.page.locator(
      'atomic-insight-user-actions-session [part="show-more-actions-button"]'
    );
  }

  get moreActionsSection() {
    return this.page.locator(
      'atomic-insight-user-actions-session [data-testid="more-actions-section"]'
    );
  }

  get userActionsList() {
    return this.page.locator('atomic-insight-user-actions-session ol li');
  }
}
