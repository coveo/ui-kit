import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class UserActionsTimelinePageObject extends BasePageObject<'atomic-insight-user-actions-timeline'> {
  constructor(page: Page) {
    super(page, 'atomic-insight-user-actions-timeline');
  }

  get activeSession() {
    return this.page.locator('[data-testid="active-session"]');
  }

  get followingSession() {
    return this.page.locator('[data-testid="following-session"]');
  }

  get precedingSession() {
    return this.page.locator('[data-testid="preceding-session"]');
  }

  get showFollowingSessionsbutton() {
    return this.page.getByLabel('Show following sessions');
  }

  get hideFollowingSessionsbutton() {
    return this.page.getByLabel('Hide following sessions');
  }

  get showPrecedingSessionsbutton() {
    return this.page.getByLabel('Show preceding sessions');
  }

  get hidePrecedingSessionsbutton() {
    return this.page.getByLabel('Hide preceding sessions');
  }

  get userActionsError() {
    return this.page.locator('[data-testid="user-actions-error"]');
  }

  get showMoreActionsButton() {
    return this.page.locator('[data-testid="show-more-actions-button"] button');
  }

  get moreActionsSection() {
    return this.page.locator('[data-testid="more-actions-section"]');
  }

  async mockUserActions(
    page: Page,
    userActions: Array<{name: string; value: string; time: number}>
  ) {
    // Navigate to the story with MSW configured for user actions
    const currentUrl = page.url();
    const baseUrl = currentUrl.split('?')[0];

    // Determine which story to navigate to based on the number of actions
    let storyId: string;
    if (userActions.length === 0) {
      storyId = 'atomic-insight-user-actions-timeline--default'; // Default story handles empty state
    } else if (userActions.length > 5) {
      storyId = 'atomic-insight-user-actions-timeline--with-many-user-actions';
    } else {
      storyId = 'atomic-insight-user-actions-timeline--with-user-actions';
    }

    await page.goto(`${baseUrl}?id=${storyId}`);
  }

  async mockUserActionsError(page: Page) {
    // Navigate to the story with MSW configured for user actions error
    const currentUrl = page.url();
    const baseUrl = currentUrl.split('?')[0];
    await page.goto(
      `${baseUrl}?id=atomic-insight-user-actions-timeline--with-user-actions-error`
    );
  }
}
