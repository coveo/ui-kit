import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicInsightSmartSnippetFeedbackModalPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-smart-snippet-feedback-modal');
  }

  get openModalButton() {
    return this.page.locator('#open-modal-btn');
  }

  get modal() {
    return this.page.locator('atomic-modal');
  }

  get feedbackOptions() {
    return this.page.getByText("This didn't answer my");
  }

  get explainWhyHeading() {
    return this.page.getByRole('heading', {name: 'Explain why'});
  }

  get selectReasonHeading() {
    return this.page.getByText('Select the reason');
  }
}
