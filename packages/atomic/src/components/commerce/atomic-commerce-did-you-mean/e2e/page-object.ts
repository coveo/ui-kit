import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicCommerceDidYouMeanPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-did-you-mean');
  }

  get noResults() {
    return this.page.getByText("We couldn't find anything for runing shoes");
  }

  get autoCorrection() {
    return this.page.getByText(
      'Query was automatically corrected to running shoes'
    );
  }
}
