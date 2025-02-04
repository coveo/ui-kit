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

  async clickOnSmartSnippetSuggestionHeading(index: number): Promise<void> {
    await this.smartSnippetSuggestionHeading.nth(index).click();
  }

  async clickOnSmartSnippetSuggestionSourceUri(index: number): Promise<void> {
    await this.smartSnippetSuggestionSourceUri.nth(index).click();
  }

  async clickOnSmartSnippetSuggestionSourceTitle(index: number): Promise<void> {
    await this.smartSnippetSuggestionSourceTitle.nth(index).click();
  }

  async clickOnSmartSnippetSuggestionInlineLink(index: number): Promise<void> {
    await this.smartSnippetSuggestionInlineLink.nth(index).click();
  }

  async waitForExpandSmartSnippetSuggestionUaAnalytics(
    expectedFields: Record<string, any>
  ): Promise<Request> {
    return this.waitForSmartSnippetSuggestionsCustomUaAnalytics(
      'expandSmartSnippetSuggestion',
      (customData: Record<string, any>) => {
        return Object.keys(expectedFields).every(
          (key) => customData?.[key] === expectedFields[key]
        );
      }
    );
  }

  async waitForCollapseSmartSnippetSuggestionUaAnalytics(
    expectedFields: Record<string, any>
  ): Promise<Request> {
    return this.waitForSmartSnippetSuggestionsCustomUaAnalytics(
      'collapseSmartSnippetSuggestion',
      (customData: Record<string, any>) => {
        return Object.keys(expectedFields).every(
          (key) => customData?.[key] === expectedFields[key]
        );
      }
    );
  }

  async waitForSmartSnippetSuggestionSourceClickUaAnalytics(
    expectedCustomFields: Record<string, any>
  ): Promise<Request> {
    return this.waitForSmartSnippetSuggestionsClickUaAnalytics(
      'openSmartSnippetSuggestionSource',
      (customData: Record<string, any>) => {
        return Object.keys(expectedCustomFields).every(
          (key) => customData?.[key] === expectedCustomFields[key]
        );
      }
    );
  }

  async waitForSmartSnippetSuggestionInlineLinkClickUaAnalytics(
    expectedCustomFields: Record<string, any>
  ): Promise<Request> {
    return this.waitForSmartSnippetSuggestionsClickUaAnalytics(
      'openSmartSnippetSuggestionInlineLink',
      (customData: Record<string, any>) => {
        return Object.keys(expectedCustomFields).every(
          (key) => customData?.[key] === expectedCustomFields[key]
        );
      }
    );
  }

  async waitForSmartSnippetSuggestionsClickUaAnalytics(
    actionCause: string,
    customChecker?: Function
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaClickEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const requestData = JSON.parse(requestBody.clickEvent);

        const expectedFields: Record<string, any> = {
          actionCause,
        };

        const matchesExpectedFields = Object.keys(expectedFields).every(
          (key) => requestData?.[key] === expectedFields[key]
        );

        const customData = requestData?.customData;

        return (
          matchesExpectedFields &&
          (customChecker
            ? customChecker(requestData.customData, customData)
            : true)
        );
      }
      return false;
    });
    return uaRequest;
  }

  async waitForSmartSnippetSuggestionsCustomUaAnalytics(
    eventValue: string,
    customChecker?: Function
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

        const customData = requestBody?.customData;

        return (
          matchesExpectedFields &&
          (customChecker ? customChecker(customData) : true)
        );
      }
      return false;
    });
    return uaRequest;
  }
}
