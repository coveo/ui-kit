import type {Locator, Page, Request} from '@playwright/test';
import {
  isUaCustomEvent,
  isUaSearchEvent,
} from '../../../../../../playwright/utils/requests';

export class SearchBoxSuggestionsListObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get searchBoxSuggestionsList(): Locator {
    return this.page.locator('c-quantic-search-box-suggestions-list');
  }

  get searchBoxInput(): Locator {
    return this.page.getByTestId('search-box-input');
  }

  get suggestionsList(): Locator {
    return this.searchBoxSuggestionsList.getByRole('listbox');
  }

  get firstSuggestion(): Locator {
    return this.suggestionsList.getByRole('option').first();
  }

  get suggestionCount(): Promise<number> {
    return this.suggestionsList.getByRole('option').count();
  }

  get clearRecentQueriesButton(): Locator {
    return this.page.getByTestId('clear-recent-queries-button');
  }

  getSuggestionAtIndex(index: number): Locator {
    return this.suggestionsList.getByRole('option').nth(index);
  }

  getSuggestionByText(text: string): Locator {
    return this.suggestionsList.getByRole('option').filter({
      hasText: text,
    });
  }

  async focusOutsideSearchBox(): Promise<void> {
    await this.page.locator('body').click();
  }

  async waitForQuerySuggestSearchAnalytics(
    expectedFields: Record<string, any>
  ): Promise<Request> {
    return this.waitForSearchAnalytics(
      'omniboxAnalytics',
      (data: Record<string, any>) => {
        return Object.keys(expectedFields).every(
          (key) => data?.[key] === expectedFields[key]
        );
      }
    );
  }

  async waitForRecentQuerySearchAnalytics(
    expectedFields: Record<string, any>
  ): Promise<Request> {
    return this.waitForSearchAnalytics(
      'recentQueriesClick',
      (data: Record<string, any>) => {
        return Object.keys(expectedFields).every(
          (key) => data?.[key] === expectedFields[key]
        );
      }
    );
  }

  async waitForClearRecentQueriesAnalytics(
    expectedFields: Record<string, any>
  ): Promise<Request> {
    return this.waitForCustomUARequest(
      'recentQueries',
      'clearRecentQueries',
      (data: Record<string, any>) => {
        return Object.keys(expectedFields).every(
          (key) => data?.[key] === expectedFields[key]
        );
      }
    );
  }

  async waitForSearchAnalytics(
    actionCause: string,
    customChecker?: Function
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaSearchEvent(request)) {
        const requestBody = request.postDataJSON?.();

        const expectedFields: Record<string, any> = {
          actionCause: actionCause,
        };

        const matchesExpectedFields = Object.keys(expectedFields).every(
          (key) => requestBody?.[key] === expectedFields[key]
        );

        return (
          matchesExpectedFields &&
          (customChecker ? customChecker(requestBody) : true)
        );
      }
      return false;
    });
    return uaRequest;
  }

  async waitForCustomUARequest(
    eventType: string,
    eventValue: string,
    customChecker?: Function
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaCustomEvent(request)) {
        const requestBody = request.postDataJSON?.();

        const expectedFields: Record<string, any> = {
          eventType,
          eventValue,
        };

        const matchesExpectedFields = Object.keys(expectedFields).every(
          (key) => requestBody?.[key] === expectedFields[key]
        );

        return (
          matchesExpectedFields &&
          (customChecker ? customChecker(requestBody) : true)
        );
      }
      return false;
    });
    return uaRequest;
  }
}
