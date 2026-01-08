import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class HistoryTogglePageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-history-toggle');
  }

  get historyButton() {
    return this.page.getByRole('button', {name: 'history'});
  }
}
