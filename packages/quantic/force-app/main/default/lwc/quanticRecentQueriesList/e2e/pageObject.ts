import type {Locator, Page, Request} from '@playwright/test';
import {isUaSearchEvent} from '../../../../../../playwright/utils/requests';

export class RecentQueriesListObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get recentQueriesList(): Locator {
    return this.page.locator('c-quantic-recent-queries-list');
  }

  get recentQueriesListItems(): Locator {
    return this.recentQueriesList.getByTestId('recent-query-item');
  }

  async waitForRecentQueryClickAnalytics(
    expectedFields: Record<string, any>
  ): Promise<Request> {
    return this.waitForRecentQueriesListSearchAnalytics(
      'recentQueriesClick',
      (data: Record<string, any>) => {
        return Object.keys(expectedFields).every(
          (key) => data?.[key] === expectedFields[key]
        );
      }
    );
  }

  async waitForRecentQueriesListSearchAnalytics(
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
}
