import type {Locator, Page} from '@playwright/test';

export class FacetManagerObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get facetManager(): Locator {
    return this.page.locator('c-quantic-facet-manager');
  }

  get facetManagerItems(): Locator {
    return this.facetManager.locator('.facet-manager__item');
  }

  getFacetManagerItemByIndex(index: number): Locator {
    return this.facetManagerItems.nth(index);
  }

  getAllFacetManagerItems(): Promise<Locator[]> {
    return this.facetManager.locator('.facet-manager__item').all();
  }
}
