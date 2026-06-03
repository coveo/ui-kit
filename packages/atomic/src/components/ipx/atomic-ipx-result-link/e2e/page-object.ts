import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class IpxResultLinkPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-ipx-result-link');
  }

  anchor() {
    return this.page.getByRole('link');
  }
}
