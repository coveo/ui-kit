import type {Locator, Page, Request} from '@playwright/test';
import {isUaCustomEvent} from '../../../../../../playwright/utils/requests';

const loadMoreResultsElementsSelectors = {
  component: 'c-quantic-load-more-results',
  componentError: 'c-quantic-component-error',
  loadMoreButtonTestId: 'load-more-results-button',
  summaryTestId: 'summary',
  progressBarTestId: 'progress-bar',
};

export class LoadMoreResultsObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get component(): Locator {
    return this.page.locator(loadMoreResultsElementsSelectors.component);
  }

  get loadMoreButton(): Locator {
    return this.page.getByTestId(
      loadMoreResultsElementsSelectors.loadMoreButtonTestId
    );
  }

  get summary(): Locator {
    return this.page.getByTestId(
      loadMoreResultsElementsSelectors.summaryTestId
    );
  }

  get progressBar(): Locator {
    return this.page.getByTestId(
      loadMoreResultsElementsSelectors.progressBarTestId
    );
  }

  async clickLoadMoreButton(): Promise<void> {
    await this.loadMoreButton.click();
  }

  async waitForLoadMoreResultsUaAnalytics(): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaCustomEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const expectedFields = {
          eventType: 'getMoreResults',
          eventValue: 'pagerScrolling',
        };
        return Object.keys(expectedFields).every(
          (key) => requestBody?.[key] === expectedFields[key]
        );
      }
      return false;
    });
    return uaRequest;
  }
}
