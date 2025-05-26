import type {Locator, Page} from '@playwright/test';

export class DateFacetObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get facet(): Locator {
    return this.page.locator('c-quantic-date-facet');
  }

  get facetValue(): Locator {
    return this.facet.getByTestId('facet__value');
  }

  get clearSelectionButton(): Locator {
    return this.facet.getByRole('button', {name: /Clear filter/i});
  }

  async getFacetValueWithText(text: string): Promise<Locator> {
    return this.facetValue.filter({hasText: text}).first();
  }

  async clickOnFacetValueWithText(text: string): Promise<void> {
    await this.facetValue.filter({hasText: text}).first().click();
  }
}
