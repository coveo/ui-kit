import type {Page} from '@playwright/test';

export class FacetPageObject {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
  get facetsSection() {
    return this.page.locator('.Facets');
  }

  get firstFacet() {
    return this.page.getByLabel(/(Select|Deselect) facet value.*/).first();
  }

  get facetLoading() {
    return this.page.locator('.FacetLoading').first();
  }

  async getFacetByLabel(label: string) {
    return this.page.getByLabel(label);
  }
}
