import type {Locator, Page, Request} from '@playwright/test';
import {isUaSearchEvent} from '../../../../../../playwright/utils/requests';

export class DidYouMeanObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get setQueryInput(): Locator {
    return this.page.locator('c-action-perform-search input');
  }

  get performSearchButton(): Locator {
    return this.page.locator('c-action-perform-search button');
  }

  get didYouMeanNoResultsLabel(): Locator {
    return this.page.getByTestId('no-result-label');
  }

  get didYouMeanAutomaticQueryCorrectionLabel(): Locator {
    return this.page.getByTestId('automatic-query-correction-label');
  }

  async setQuery(query: string): Promise<void> {
    await this.setQueryInput.fill(query);
  }

  async performSearch(): Promise<void> {
    await this.performSearchButton.click();
  }

  async waitForDidYouMeanAutomaticAnalytics(
    expectedFields: Record<string, any>
  ): Promise<Request> {
    return this.waitForDidYouMeanSearchAnalytics(
      'didyoumeanAutomatic',
      (data: Record<string, any>) => {
        return Object.keys(expectedFields).every(
          (key) => data?.[key] === expectedFields[key]
        );
      }
    );
  }

  async waitForDidYouMeanSearchAnalytics(
    actionCause: string,
    customChecker?: Function
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaSearchEvent(request)) {
        const requestBody = request.postDataJSON?.();

        const expectedFields: Record<string, any> = {
          actionCause: actionCause,
          originContext: 'Search',
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
