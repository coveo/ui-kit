import {Page} from '@playwright/test';

export class FacetPageObject {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
  async getFacetsSection() {
    return this.page.locator('.Facets');
  }

  async getFirstFacet() {
    return this.page.getByLabel(/(Select|Deselect) facet value.*/).first();
  }

  async getFacetLoading() {
    return this.page.locator('.FacetLoading').first();
  }

  async getFacetByLabel(label: string) {
    return this.page.getByLabel(label);
  }
}
