import {Page, Locator, Response} from '@playwright/test';
import {
  documentsSuggestResponses,
  type DocumentsSuggestResponse,
} from '@coveo/platform-mock-api/caseassist';
import {
  classifyRequestRegex,
  documentsSuggestRequestRegex,
} from '../utils/requests';

export const fakeCaseAssistId = 'e2e-fake-case-assist-id';

/**
 * The ID of the "Demo" Case Assist configuration of the searchuisamples
 * organization, for the few tests that call the live Case Assist API.
 */
export const demoCaseAssistId = 'a4fb453a-b1f1-4054-9067-bef117586baa';

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

  async mockDocumentSuggestions(
    response: DocumentsSuggestResponse = documentsSuggestResponses.baseResponse
  ): Promise<void> {
    await this.page.route(documentsSuggestRequestRegex, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }
}
