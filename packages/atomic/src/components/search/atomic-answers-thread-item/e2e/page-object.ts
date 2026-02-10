import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AnswersThreadItemPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-answers-thread-item');
  }

  get titleButton() {
    return this.hydrated.locator('[part="title-button"]');
  }

  get titleText() {
    return this.hydrated.locator('[part="title"]');
  }

  get content() {
    return this.hydrated.locator('[part="content"]');
  }

  get timelineLine() {
    return this.hydrated.locator('[part="timeline-line"]');
  }
}
