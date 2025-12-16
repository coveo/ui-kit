import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicSmartSnippetFeedbackModalPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-smart-snippet-feedback-modal');
  }

  get openModalButton() {
    return this.page.locator('#open-modal-btn');
  }

  get modal() {
    return this.page.locator('atomic-modal');
  }
}
