import type {Locator, Page, Request} from '@playwright/test';
import {
  isUaCustomEvent,
  isUaClickEvent,
} from '../../../../../../playwright/utils/requests';

export class SmartSnippetSuggestionsObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get smartSnippetSuggestions(): Locator {
    return this.page.locator('c-quantic-smart-snippet-suggestions');
  }

  get smartSnippetSuggestionHeading(): Locator {
    return this.page.locator(
      'lightning-accordion-section .slds-accordion__summary-heading'
    );
  }

  get smartSnippetSuggestionSourceUri(): Locator {
    return this.page.getByTestId('smart-snippet__source-uri');
  }

  get smartSnippetSuggestionSourceTitle(): Locator {
    return this.page.getByTestId('smart-snippet__source-title');
  }

  get smartSnippetSuggestionInlineLink(): Locator {
    return this.page.getByTestId('smart-snippet-answer').locator('a');
  }

  async clickOnSmartSnippetSuggestionHeadingByIndex(
    index: number
  ): Promise<void> {
    await this.smartSnippetSuggestionHeading.nth(index).click();
  }

  async clickOnSmartSnippetSuggestionSourceUriByIndex(
    index: number
  ): Promise<void> {
    await this.smartSnippetSuggestionSourceUri.nth(index).click();
  }

  async clickOnSmartSnippetSuggestionSourceTitleByIndex(
    index: number
  ): Promise<void> {
    await this.smartSnippetSuggestionSourceTitle.nth(index).click();
  }

  async clickOnSmartSnippetSuggestionInlineLinkByIndex(
    index: number
  ): Promise<void> {
    await this.smartSnippetSuggestionInlineLink.nth(index).click();
  }

  async waitForExpandSmartSnippetSuggestionUaAnalytics(): Promise<Request> {
    return this.waitForSmartSnippetSuggestionsCustomUaAnalytics(
      'expandSmartSnippetSuggestion'
    );
  }

  async waitForCollapseSmartSnippetSuggestionUaAnalytics(): Promise<Request> {
    return this.waitForSmartSnippetSuggestionsCustomUaAnalytics(
      'collapseSmartSnippetSuggestion'
    );
  }

  async waitForSmartSnippetSuggestionSourceClickUaAnalytics(): Promise<Request> {
    return this.waitForSmartSnippetSuggestionsClickUaAnalytics(
      'openSmartSnippetSuggestionSource'
    );
  }

  async waitForSmartSnippetSuggestionInlineLinkClickUaAnalytics(): Promise<Request> {
    return this.waitForSmartSnippetSuggestionsClickUaAnalytics(
      'openSmartSnippetSuggestionInlineLink'
    );
  }

  async waitForSmartSnippetSuggestionsClickUaAnalytics(
    actionCause: string
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaClickEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const requestData = JSON.parse(requestBody.clickEvent);

        const expectedFields: Record<string, any> = {
          actionCause,
        };

        return requestData?.actionCause === expectedFields.actionCause;
      }
      return false;
    });
    return uaRequest;
  }

  async waitForSmartSnippetSuggestionsCustomUaAnalytics(
    eventValue: string
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaCustomEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const expectedFields: Record<string, any> = {
          eventType: 'smartSnippetSuggestions',
          eventValue: eventValue,
        };

        const matchesExpectedFields = Object.keys(expectedFields).every(
          (key) => requestBody?.[key] === expectedFields[key]
        );

        return matchesExpectedFields;
      }
      return false;
    });

    return uaRequest;
  }
}
