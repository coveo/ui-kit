import type {Locator, Page, Request} from '@playwright/test';
import {
  isUaClickEvent,
  isEventProtocol,
} from '../../../../../../playwright/utils/requests';

export class DocumentSuggestionObject {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get documentSuggestion() {
    return this.page.locator('c-quantic-document-suggestion');
  }

  get accordion() {
    return this.page.locator('lightning-accordion');
  }

  get sections() {
    return this.page.locator('lightning-accordion-section');
  }

  get noSuggestionsMessage() {
    return this.page.getByText('No suggestions', {exact: true});
  }

  sectionContent(index: number): Locator {
    return this.sections.nth(index).locator('div.slds-accordion__content');
  }

  async clickSuggestion(index: number): Promise<void> {
    await this.sections.nth(index).click();
  }

  async waitForSuggestionClickEvent(mode: string): Promise<Request> {
    return this.page.waitForRequest((request) => {
      if (mode === 'legacy' && isUaClickEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const event = JSON.parse(requestBody.clickEvent);
        return event.actionCause === 'documentSuggestionClick';
      } else if (mode === 'next' && isEventProtocol(request)) {
        const requestBody = request.postDataJSON?.();
        const requestData = requestBody[0];
        return requestData.meta.type === 'CaseAssist.DocumentSuggestionClick';
      }
      return false;
    });
  }
}
