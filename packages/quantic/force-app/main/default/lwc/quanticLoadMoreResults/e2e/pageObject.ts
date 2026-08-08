import type {Locator, Page} from '@playwright/test';

const loadMoreResultsElementsSelectors = {
  component: 'c-quantic-load-more-results',
  componentError: 'c-quantic-component-error',
  summary: 'c-quantic-load-more-results lightning-formatted-rich-text',
  progressBar: 'c-quantic-load-more-results .load-more-results__progress-bar',
  loadMoreButton: 'c-quantic-load-more-results button',
  results: 'c-quantic-result',
};

export class LoadMoreResultsObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get component(): Locator {
    return this.page.locator(loadMoreResultsElementsSelectors.component);
  }

  get componentError(): Locator {
    return this.page.locator(loadMoreResultsElementsSelectors.componentError);
  }

  get summary(): Locator {
    return this.page.locator(loadMoreResultsElementsSelectors.summary);
  }

  get progressBar(): Locator {
    return this.page.locator(loadMoreResultsElementsSelectors.progressBar);
  }

  get loadMoreButton(): Locator {
    return this.page.locator(loadMoreResultsElementsSelectors.loadMoreButton);
  }

  get results(): Locator {
    return this.page.locator(loadMoreResultsElementsSelectors.results);
  }

  async clickLoadMoreButton(): Promise<void> {
    await this.loadMoreButton.click();
  }
}
