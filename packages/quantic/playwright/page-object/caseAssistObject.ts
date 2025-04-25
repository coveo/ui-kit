import {Page, Locator, Response} from '@playwright/test';
import {
  classifyRequestRegex,
  documentsSuggestRequestRegex,
} from '../utils/requests';

export class CaseAssistObject {
  constructor(private page: Page) {
    this.page = page;
  }

  get fetchSuggestionsButton(): Locator {
    return this.page.getByRole('button', {name: 'Fetch suggestions'});
  }

  get fetchClassificationsButton(): Locator {
    return this.page.locator('c-action-fetch-classifications button');
  }

  async fetchClassifications(): Promise<void> {
    await this.fetchClassificationsButton.click();
  }

  async fetchSuggestions(): Promise<void> {
    await this.fetchSuggestionsButton.click();
  }

  async waitForCaseClassificationsResponse(): Promise<Response> {
    return this.page.waitForResponse(classifyRequestRegex);
  }

  async waitForDocumentSuggestionResponse(): Promise<Response> {
    return this.page.waitForResponse(documentsSuggestRequestRegex);
  }
}
