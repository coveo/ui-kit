import {Locator, Page} from '@playwright/test';
// import {isUaCustomEvent} from '../../../../../../playwright/utils/requests';

export class TabObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get tab(): Locator {
    return this.page.locator('c-quantic-tab');
  }
}
