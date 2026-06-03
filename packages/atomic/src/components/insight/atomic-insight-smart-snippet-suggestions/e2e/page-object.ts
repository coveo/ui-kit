import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class SmartSnippetSuggestionsPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-smart-snippet-suggestions');
  }

  get container() {
    return this.hydrated.locator('[part="container"]');
  }

  get heading() {
    return this.hydrated.locator('[part="heading"]');
  }

  get questions() {
    return this.hydrated.locator('[part="questions"]');
  }

  get collapsedQuestionButtons() {
    return this.hydrated.locator('[part="question-button-collapsed"]');
  }

  get expandedQuestionButtons() {
    return this.hydrated.locator('[part="question-button-expanded"]');
  }

  get answerAndSources() {
    return this.hydrated.locator('[part="answer-and-source"]');
  }
}
