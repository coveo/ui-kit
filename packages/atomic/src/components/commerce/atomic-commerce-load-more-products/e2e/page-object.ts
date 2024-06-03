import type {Page} from '@playwright/test';

export class AtomicCommerceLoadMoreProductsLocators {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  summary({index, total}: {index?: number; total?: number} = {}) {
    return this.page.getByText(
      new RegExp(
        `Showing ${index ?? '\\d'} of ${total ?? '\\d'} result${total === 1 ? '' : 's'}.`
      )
    );
  }

  get loadMoreButton() {
    return this.page.getByText('Load more results');
  }
}
