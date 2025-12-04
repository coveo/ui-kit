import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class AtomicCategoryFacetPageObject extends BasePageObject<'atomic-category-facet'> {
  constructor(page: Page) {
    super(page, 'atomic-category-facet');
  }

  get getFacetSearch() {
    return this.page.getByLabel('Search');
  }

  get getFacetValue() {
    return this.page.locator('[part="search-result"]');
  }

  get getAllCategoriesButton() {
    return this.page.locator('[part="all-categories-button"]');
  }

  get facetSearchMoreMatchesFor() {
    return this.page.getByRole('button', {name: 'More matches for p'});
  }

  getFacetValueByLabel(label: string) {
    return this.page.locator('[part="value-label"]', {hasText: label});
  }
}
