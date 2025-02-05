import type {Locator, Page} from '@playwright/test';

export class FacetObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get facet(): Locator {
    return this.page.locator('c-quantic-facet');
  }
}
