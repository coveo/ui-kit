import type {Locator, Page} from '@playwright/test';

export class NumericFacetObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get facet(): Locator {
    return this.page.locator('c-quantic-numeric-facet');
  }

  get facetValue(): Locator {
    return this.facet.getByTestId('facet__value');
  }

  get facetValueInput(): Locator {
    return this.facet.getByRole('checkbox', {name: 'Facet value option'});
  }

  get filterMinInput(): Locator {
    return this.facet.getByRole('spinbutton', {
      name: /enter a minimum numerical value for the .* facet/i,
    });
  }

  get filterMaxInput(): Locator {
    return this.facet.getByRole('spinbutton', {
      name: /enter a maximum numerical value for the .* facet/i,
    });
  }

  get filterApplyButton(): Locator {
    return this.facet.getByRole('button', {name: /apply/i});
  }

  get clearSelectionButton(): Locator {
    return this.page.getByTestId('clear-selection-button');
  }

  async clickOnFacetValue(index: number): Promise<void> {
    await this.facetValue.nth(index).click();
  }

  async fillFilterMinInput(min: string): Promise<void> {
    await this.filterMinInput.fill(min);
  }

  async fillFilterMaxInput(max: string): Promise<void> {
    await this.filterMaxInput.fill(max);
  }

  async clickOnFilterApplyButton(): Promise<void> {
    await this.filterApplyButton.click();
  }

  async clickOnClearSelectionButton(): Promise<void> {
    await this.clearSelectionButton.click();
  }
}
