import {Locator, Page} from '@playwright/test';
// import {isUaCustomEvent} from '../../../../../../playwright/utils/requests';

export class TabBarObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get tabBar(): Locator {
    return this.page.locator('c-quantic-tab-bar');
  }
}
