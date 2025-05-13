import type {Locator, Page} from '@playwright/test';

export class FacetObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get facet(): Locator {
    return this.page.locator('c-quantic-facet');
  }

  get facetValue(): Locator {
    return this.facet.getByTestId('facet__value');
  }

  get facetValueInput(): Locator {
    return this.facet.getByRole('checkbox', {name: 'Facet value option'});
  }

  get showMoreFacetValuesButton(): Locator {
    return this.facet.getByRole('button', {
      name: /Show more values for the .* facet/i,
    });
  }

  get showLessFacetValuesButton(): Locator {
    return this.facet.getByRole('button', {
      name: /Show less values for the .* facet/i,
    });
  }

  get facetSearchBoxInput(): Locator {
    return this.facet.getByTestId('facet__searchbox-input').locator('input');
  }

  get facetBreadcrumb(): Locator {
    return this.page.getByTestId('facet-breadcrumb');
  }

  get clearSelectionButton(): Locator {
    return this.page.getByTestId('clear-selection-button');
  }

  facetBreadcrumbValueByIndex(index: number): Locator {
    return this.facetBreadcrumb.locator('c-quantic-pill').nth(index);
  }

  async clickOnFacetValue(index: number): Promise<void> {
    await this.facetValue.nth(index).click();
  }

  async clickOnShowMoreFacetValuesButton(): Promise<void> {
    await this.showMoreFacetValuesButton.click();
  }

  async clickOnShowLessFacetValuesButton(): Promise<void> {
    await this.showLessFacetValuesButton.click();
  }

  async fillFacetSearchBoxInput(query: string): Promise<void> {
    await this.facetSearchBoxInput.fill(query);
  }

  async clickOnClearSelectionButton(): Promise<void> {
    await this.clearSelectionButton.click();
  }
}
