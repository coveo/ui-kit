import type {Locator, Page} from '@playwright/test';

export class CategoryFacetObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get facet(): Locator {
    return this.page.locator('c-quantic-category-facet');
  }

  get facetValue(): Locator {
    return this.facet.locator('c-quantic-category-facet-value');
  }

  get activeParent(): Locator {
    return this.facet.getByTestId('facet__active-parent');
  }

  get allCategoriesButton(): Locator {
    return this.facet.getByRole('button', {name: /all categories/i});
  }

  get facetValueInput(): Locator {
    return this.facet.getByRole('checkbox', {name: 'Facet value option'});
  }

  get showMoreFacetValuesButton(): Locator {
    return this.facet.getByTestId('facet-values__show-more');
  }

  get showLessFacetValuesButton(): Locator {
    return this.facet.getByTestId('facet-values__show-less');
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
