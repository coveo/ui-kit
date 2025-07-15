import type {Locator, Page} from '@playwright/test';

export class SearchPageObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get searchbox(): Locator {
    return this.page.locator('c-quantic-search-box');
  }

  get errorComponent(): Locator {
    return this.page.locator('c-quantic-error');
  }

  get searchboxInput(): Locator {
    return this.searchbox.getByTestId('search-box-input');
  }

  get refineToggle(): Locator {
    return this.page.locator('c-quantic-refine-toggle');
  }

  get tabBar(): Locator {
    return this.page.locator('c-quantic-tab-bar');
  }

  get results(): Locator {
    return this.page.locator('c-quantic-result');
  }

  get sort(): Locator {
    return this.page.getByTestId('search-page-sort');
  }

  get sortDropdownButton(): Locator {
    return this.sort.locator('button');
  }

  async sortOptionButton(buttonName: string): Promise<Locator> {
    return this.sort.getByRole('option', {name: buttonName});
  }

  async allSortLabelOptions() {
    const options = await this.page
      .locator('div[part="dropdown overlay"]')
      .allInnerTexts();
    const arrSort = options[0].split('\n');
    return arrSort;
  }

  async getSortLabelValue() {
    const arrSort = await this.allSortLabelOptions();
    const sortLabelwithValueList = await Promise.all(
      arrSort.map(async (item) => ({
        label: item,
        value: await this.page
          .getByRole('option', {name: item})
          .getAttribute('data-value'),
      }))
    );
    return sortLabelwithValueList;
  }

  sortButton(buttonName: string): Locator {
    return this.page.getByRole('option', {name: buttonName});
  }

  async clickSortButton(buttonName: string): Promise<void> {
    await this.sortButton(buttonName).click();
  }

  get summary(): Locator {
    return this.page.locator('c-quantic-summary');
  }

  get facetsManager(): Locator {
    return this.page.getByTestId('facet-manager');
  }

  // First in the facets targets the ones on the search page instead of the ones in the refine toggle modal.
  get facets(): Locator {
    return this.facetsManager.locator('c-quantic-facet').first();
  }

  get pager(): Locator {
    return this.page.locator('c-quantic-pager');
  }

  get foldedResultList(): Locator {
    return this.page.locator('c-quantic-folded-result-list');
  }

  get recentQueriesList(): Locator {
    return this.page.locator('c-quantic-recent-queries-list');
  }

  get recentQueriesListItems(): Locator {
    return this.recentQueriesList.getByTestId('recent-query-item');
  }

  get recentResultsList(): Locator {
    return this.page.locator('c-quantic-recent-results-list');
  }

  get tab(): Locator {
    return this.tabBar.locator('c-quantic-tab');
  }

  async getTabByIndex(index: number): Promise<Locator> {
    return this.tab.nth(index);
  }

  get pagerButtons(): Locator {
    return this.pager.locator('button');
  }

  async clickOnPagerButtonByIndex(index: number): Promise<void> {
    await this.pagerButtons.nth(index).click();
  }

  get clearFiltersButton(): Locator {
    // Here the first represents the main clear filters button.
    return this.page.getByTestId('clear-selection-button').first();
  }

  async clickOnClearFiltersButton(): Promise<void> {
    await this.clearFiltersButton.click();
  }

  get firstFacetsContainer(): Locator {
    return this.page.locator('c-quantic-card-container').nth(0);
  }

  async getFacetValueByIndex(index: number): Promise<Locator> {
    return this.firstFacetsContainer.getByTestId('facet__value').nth(index);
  }
}
