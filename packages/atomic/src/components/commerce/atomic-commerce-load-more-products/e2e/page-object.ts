import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../playwrightUtils/base-page-object';

export class LoadMoreProductsPageObject extends BasePageObject<'atomic-commerce-load-more-products'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-load-more-products');
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
