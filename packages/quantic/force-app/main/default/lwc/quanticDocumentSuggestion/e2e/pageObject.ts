import type {Locator, Page, Request} from '@playwright/test';
import {
  isUaClickEvent,
  isUaEventsEvent,
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

  sectionQuickviewButton(index: number): Locator {
    return this.sections
      .nth(index)
      .locator('c-quantic-result-quickview')
      .getByRole('button', {name: /Open.+for preview/});
  }

  sectionRatingButton(index: number): Locator {
    return this.sections.nth(index).getByRole('button', {name: 'Send rating'});
  }

  async numberOfSuggestions(): Promise<number> {
    return this.sections.count();
  }

  async clickSuggestion(index: number): Promise<void> {
    await this.sections.nth(index).click();
  }

  async waitForSuggestionClickEvent(mode: string): Promise<Request> {
    return this.page.waitForRequest((request) => {
      if (
        (mode === 'legacy' && isUaClickEvent(request)) ||
        (mode === 'next' && isUaEventsEvent(request))
      ) {
        return true;
      }
      return false;
    });
  }
}
