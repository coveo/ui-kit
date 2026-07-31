import type {Locator, Page} from '@playwright/test';

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
}
