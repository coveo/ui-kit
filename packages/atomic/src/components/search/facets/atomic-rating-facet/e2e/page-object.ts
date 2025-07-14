import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class AtomicRatingFacetPageObject extends BasePageObject<'atomic-rating-facet'> {
  constructor(page: Page) {
    super(page, 'atomic-rating-facet');
  }

  getFacetValueByPosition(valuePosition: number) {
    return this.facetValues.nth(valuePosition);
  }

  getFacetValueButtonByPosition(valuePosition: number) {
    const value = this.getFacetValueByPosition(valuePosition);
    return value.locator('button');
  }

  get clearFilter() {
    return this.page.getByRole('button').filter({hasText: /Clear.*filter/});
  }

  get getSelectedFacetValueLink() {
    return this.page.locator('[part="value-link value-link-selected"]');
  }

  get facetValues() {
    return this.page.getByRole('listitem');
  }
}
