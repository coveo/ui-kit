import type {Locator, Page, Response} from '@playwright/test';
import {insightSearchRequestRegex} from '../../../../../../playwright/utils/requests';

export type SearchRequestBody = {
  q?: string;
  tab?: string;
  firstResult?: number;
  facets?: Array<{currentValues: Array<{value: string; state: string}>}>;
};

export class InsightPanelObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get insightPanel(): Locator {
    return this.page.locator('c-example-insight-panel');
  }

  get errorComponent(): Locator {
    return this.insightPanel.locator('c-quantic-error');
  }

  get searchbox(): Locator {
    return this.insightPanel.locator('c-quantic-search-box');
  }

  get refineToggle(): Locator {
    return this.insightPanel.locator('c-quantic-refine-toggle');
  }

  get insightSummary(): Locator {
    return this.insightPanel.locator('c-quantic-insight-summary');
  }

  get tabBar(): Locator {
    return this.insightPanel.locator('c-quantic-tab-bar');
  }

  get results(): Locator {
    return this.insightPanel.locator('c-quantic-result');
  }

  get pager(): Locator {
    return this.insightPanel.locator('c-quantic-pager');
  }

  get foldedResultList(): Locator {
    return this.insightPanel.locator('c-quantic-folded-result-list');
  }

  get searchboxInput(): Locator {
    return this.searchbox.getByTestId('search-box-input');
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

  get refineToggleButton(): Locator {
    return this.page.getByTestId('refine-toggle__button');
  }

  async clickOnRefineToggleButton(): Promise<void> {
    await this.refineToggleButton.click();
  }

  get firstFacetsContainer(): Locator {
    return this.page.getByTestId('card-container__header').nth(0);
  }

  async clickOnFirstFacetsContainer(): Promise<void> {
    await this.firstFacetsContainer.click();
  }

  async getFacetValueByIndex(index: number): Promise<Locator> {
    return this.page.getByTestId('facet__value').nth(index);
  }

  get clearFiltersButton(): Locator {
    // Here the first represents the main clear filters button.
    return this.insightPanel.getByTestId('clear-selection-button').first();
  }

  async clickOnClearFiltersButton(): Promise<void> {
    await this.clearFiltersButton.click();
  }

  /**
   * The platform can throttle searches with a 429, which Headless retries with the same request.
   * Waiting for the first search response can therefore resolve on the throttled response of the
   * step's search, or on the retried search of a previous step.
   */
  async waitForSuccessfulSearchResponse(
    predicate: (body: SearchRequestBody) => boolean
  ): Promise<Response> {
    return this.page.waitForResponse(
      (response) =>
        insightSearchRequestRegex.test(response.url()) &&
        response.ok() &&
        predicate(response.request().postDataJSON() ?? {})
    );
  }
}
