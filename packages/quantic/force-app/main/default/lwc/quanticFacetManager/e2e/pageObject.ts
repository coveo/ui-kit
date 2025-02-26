import type {Locator, Page} from '@playwright/test';

export class FacetManagerObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get facetManager(): Locator {
    return this.page.locator('c-quantic-facet-manager');
  }

  get facetManagerItems(): Locator {
    return this.facetManager.getByTestId('facet-manager__item');
  }

  get itemTemplateSlot(): Locator {
    return this.facetManager.locator('slot[name="itemTemplate"]');
  }

  getFacetManagerItemByIndex(index: number): Locator {
    return this.facetManagerItems.nth(index);
  }
}
