import {Page, Locator, Response} from '@playwright/test';
import {
  classifyRequestRegex,
  documentsSuggestRequestRegex,
} from '../utils/requests';

export class CaseAssistObject {
  constructor(private page: Page) {
    this.page = page;
  }

  get fetchClassificationsButton(): Locator {
    return this.page.locator('c-action-fetch-classifications button');
  }

  async fetchClassifications(): Promise<void> {
    await this.fetchClassificationsButton.click();
  }

  async waitForCaseClassificationsResponse(): Promise<Response> {
    return this.page.waitForResponse(classifyRequestRegex);
  }

  async waitForDocumentSuggestionResponse(): Promise<Response> {
    return this.page.waitForResponse(documentsSuggestRequestRegex);
  }
}
