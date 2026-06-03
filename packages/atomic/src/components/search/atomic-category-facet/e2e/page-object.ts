import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicCategoryFacetPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-category-facet');
  }

  get facet() {
    return this.page.locator('[part="facet"]');
  }

  get labelButton() {
    return this.page.locator('[part="label-button"]').first();
  }

  get values() {
    return this.page.locator('[part="values"]');
  }

  get valueLinks() {
    return this.facet.locator('[part~="value-link"]');
  }

  get searchInput() {
    return this.facet.locator('[part="search-input"]');
  }

  get searchResults() {
    return this.facet.locator('[part="search-results"]');
  }

  get searchResultValues() {
    return this.facet.locator('[part="search-result"]');
  }

  get allCategoriesButton() {
    return this.facet.locator('[part="all-categories-button"]');
  }

  get parentButton() {
    return this.facet.locator('[part="parent-button"]');
  }

  get activeParent() {
    return this.facet.locator('[part~="active-parent"]');
  }

  get moreMatchesButton() {
    return this.page.getByRole('button', {name: /More matches for/});
  }

  get showMoreButton() {
    return this.facet.locator('[part="show-more"]');
  }

  get showLessButton() {
    return this.facet.locator('[part="show-less"]');
  }

  getFacetValueByLabel(label: string) {
    return this.page.locator('[part="value-label"]', {hasText: label});
  }

  getSearchResultByLabel(label: string) {
    // Match the search result button by its aria-label which starts with the value name
    return this.searchResults.getByRole('button', {
      name: new RegExp(`^Inclusion filter on ${label}`),
    });
  }
}
