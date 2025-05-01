import type {Locator, Page} from '@playwright/test';

export class TimeframeFacetObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get facet(): Locator {
    return this.page.locator('c-quantic-timeframe-facet');
  }

  get facetValue(): Locator {
    return this.facet.getByTestId('facet__value');
  }

  get clearSelectionButton(): Locator {
    return this.facet.getByRole('button', {name: /Clear filter/i});
  }

  get filterStartInput(): Locator {
    return this.facet.getByRole('textbox', {name: 'Start'});
  }

  get filterEndInput(): Locator {
    return this.facet.getByRole('textbox', {name: 'End'});
  }

  get filterApplyButton(): Locator {
    return this.facet.getByRole('button', {name: /apply/i});
  }

  async fillFilterStartInput(min: string): Promise<void> {
    await this.filterStartInput.fill(min);
  }

  async fillFilterEndInput(max: string): Promise<void> {
    await this.filterEndInput.fill(max);
  }

  async clickOnFacetValue(index: number): Promise<void> {
    await this.facetValue.nth(index).click();
  }
}
