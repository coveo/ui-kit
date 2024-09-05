import {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwright-utils/base-page-object';

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
    return this.page.locator('[data-testid="show-following-sessions"] button');
  }

  get hideFollowingSessionsbutton() {
    return this.page.locator('[data-testid="hide-following-sessions"] button');
  }

  get showPrecedingSessionsbutton() {
    return this.page.locator('[data-testid="show-preceding-sessions"] button');
  }

  get hidePrecedingSessionsbutton() {
    return this.page.locator('[data-testid="hide-preceding-sessions"] button');
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
    await page.route('**/user/actions', async (route) => {
      const body = {value: userActions};

      await route.fulfill({
        body: JSON.stringify(body),
        status: 200,
        headers: {
          'content-type': 'text/html',
        },
      });
    });
  }

  async mockUserActionsError(page: Page) {
    await page.route('**/user/actions', async (route) => {
      const body = {
        message: 'Access is denied.',
        errorCode: 'ACCESS_DENIED',
        requestID: '1486603b-db83-4dc2-9580-5f8e81c8e00c',
      };

      await route.fulfill({
        body: JSON.stringify(body),
        status: 403,
        headers: {
          'content-type': 'text/html',
        },
      });
    });
  }
}
