import type {Locator, Page, Request} from '@playwright/test';
import {
  isUaSearchEvent,
  isSearchRequest,
  isUaCustomEvent,
} from '../../../../../../playwright/utils/requests';

export class DidYouMeanObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get didYouMeanNoResultsLabel(): Locator {
    return this.page.getByTestId('no-result-label');
  }

  get didYouMeanAutomaticQueryCorrectionLabel(): Locator {
    return this.page.getByTestId('automatic-query-correction-label');
  }

  get didYouMeanManualCorrectionLabel(): Locator {
    return this.page.getByTestId('did-you-mean-label');
  }

  get applyCorrectionButton(): Locator {
    return this.page.getByTestId('apply-correction-button');
  }

  get showingResultsForLabel(): Locator {
    return this.page.getByTestId('showing-results-for-label');
  }

  get searchInsteadForLabel(): Locator {
    return this.page.getByTestId('search-instead-for-label');
  }

  get undoButton(): Locator {
    return this.page.getByTestId('undo-button');
  }

  async applyCorrection(): Promise<void> {
    await this.applyCorrectionButton.click();
  }

  async undo(): Promise<void> {
    await this.undoButton.click();
  }

  async waitForDidYouMeanSearchRequest(
    expectedQuery: string
  ): Promise<Request> {
    const searchRequest = this.page.waitForRequest((request) => {
      if (isSearchRequest(request)) {
        const requestBody = request.postDataJSON?.();
        return (
          requestBody &&
          requestBody.enableDidYouMean &&
          !!requestBody.queryCorrection &&
          requestBody.q === expectedQuery
        );
      }
      return false;
    });
    return searchRequest;
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

  async waitForDidYouMeanManualAnalytics(
    expectedFields: Record<string, any>
  ): Promise<Request> {
    return this.waitForDidYouMeanSearchAnalytics(
      'didyoumeanClick',
      (data: Record<string, any>) => {
        return Object.keys(expectedFields).every(
          (key) => data?.[key] === expectedFields[key]
        );
      }
    );
  }

  async waitForQueryTriggerCustomAnalytics(
    expectedFields: Record<string, any>
  ): Promise<Request> {
    return this.waitForCustomUARequest(
      'queryPipelineTriggers',
      'query',
      (data: Record<string, any>) => {
        return Object.keys(expectedFields).every(
          (key) => data?.[key] === expectedFields[key]
        );
      }
    );
  }

  async waitForUndoQueryAnalytics(
    expectedFields: Record<string, any>
  ): Promise<Request> {
    return this.waitForDidYouMeanSearchAnalytics(
      'undoQuery',
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
