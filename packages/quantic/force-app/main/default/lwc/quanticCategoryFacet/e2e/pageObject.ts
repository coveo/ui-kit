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
    return this.page.getByTestId('category-facet-breadcrumb');
  }

  facetBreadcrumbValueByIndex(index: number): Locator {
    return this.facetBreadcrumb.locator('c-quantic-pill').nth(index);
  }

  async clickOnFacetValue(index: number): Promise<void> {
    await this.facetValue.nth(index).click();
  }

  async fillFacetSearchBoxInput(query: string): Promise<void> {
    await this.facetSearchBoxInput.fill(query);
  }
}
