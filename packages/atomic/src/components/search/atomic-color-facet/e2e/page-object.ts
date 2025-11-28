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
    return this.page.locator('[part="value-box"]');
  }

  get searchInput() {
    return this.page.locator('[part="search-input"]');
  }

  getFacetValueByLabel(label: string) {
    return this.page.getByLabel(label, {exact: false});
  }
}
