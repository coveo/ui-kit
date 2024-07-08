import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../playwright-utils/base-page-object';

export class LoadMoreProductsPageObject extends BasePageObject<'atomic-commerce-load-more-products'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-load-more-products');
  }

  summary({index, total}: {index?: number; total?: number} = {}) {
    return this.page.getByText(
      new RegExp(`Showing ${index ?? '\\d+'} of ${total ?? '\\d+'} products`)
    );
  }

  get hydrated() {
    return this.page.locator(
      'atomic-commerce-load-more-products[class*="hydrated"]'
    );
  }

  get button() {
    return this.page.getByText('Load more products');
  }

  get progressBar() {
    return this.page.locator('[part="progress-bar"]');
  }

  get progressValue() {
    return this.page.locator('[part="progress-bar"] > div');
  }
  get loadMoreButton() {
    return this.page.getByRole('button', {name: 'Load more results'});
  }
}
