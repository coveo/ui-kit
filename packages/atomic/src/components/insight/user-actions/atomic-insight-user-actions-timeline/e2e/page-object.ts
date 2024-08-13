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
    return this.page.locator('[data-testid="show-following-sessions"]');
  }

  get hideFollowingSessionsbutton() {
    return this.page.locator('[data-testid="hide-following-sessions"]');
  }

  get showPrecedingSessionsbutton() {
    return this.page.locator('[data-testid="show-preceding-sessions"]');
  }

  get hidePrecedingSessionsbutton() {
    return this.page.locator('[data-testid="hide-preceding-sessions"]');
  }

  private listSideAffix(listSide?: 'Left' | 'Right') {
    return listSide ? ` In ${listSide} list\\.` : '';
  }
}
