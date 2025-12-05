import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicColorFacetPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-color-facet');
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

  get valueBoxes() {
    return this.facet.locator('[part="value-box"]');
  }

  get valueCheckboxes() {
    return this.facet.locator('[part~="value-checkbox"]');
  }

  get searchInput() {
    return this.facet.locator('[part="search-input"]');
  }

  get clearButton() {
    return this.facet.locator('[part="clear-button"]');
  }

  get selectedValueBoxes() {
    return this.facet.locator('[part~="value-box-selected"]');
  }

  get facetSearchResults() {
    return this.facet.locator('[part="search-results"]');
  }

  getFacetValueByLabel(label: string) {
    return this.page.getByLabel(label, {exact: false});
  }
}
