import type {Locator, Page, Request} from '@playwright/test';
import {isUaCustomEvent} from '../../../../../../playwright/utils/requests';

export class SummaryObject {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get summaryComponent(): Locator {
    return this.page.locator('c-quantic-summary');
  }

  get noResultsMessage(): Locator {
    return this.page.getByText('No results', {exact: true});
  }

  get summary(): Locator {
    return this.summaryComponent.locator('lightning-formatted-rich-text');
  }

  get summaryRange(): Locator {
    return this.summary.locator('.summary__range');
  }

  get summaryQuery(): Locator {
    return this.summary.locator('.summary__query');
  }

  get summaryTotal(): Locator {
    return this.summary.locator('.summary__total');
  }

  async hasResults(): Promise<boolean> {
    return this.summaryComponent.locator('.summary__range').isVisible();
  }

  async getRange(): Promise<string> {
    return this.summaryRange.innerText();
  }

  async getTotal(): Promise<string> {
    return this.summaryTotal.innerText();
  }

  async getQuery(): Promise<string> {
    return this.summaryQuery.innerText();
  }

  async getSummary(): Promise<string> {
    return this.summary.innerText();
  }

  async setResultsPerPage(numberOfResults: number): Promise<void> {
    const perPageComponent = this.page.locator('c-action-results-per-page');
    const resultsPerPageInput = perPageComponent.getByLabel('Results per page');
    await resultsPerPageInput.fill(numberOfResults.toString());
    await perPageComponent
      .getByRole('button', {name: 'Set results per page'})
      .click();
  }

  async goToNextPage(): Promise<void> {
    await this.page
      .locator('c-action-next-results')
      .getByRole('button', {name: 'Get next results'})
      .click();
  }

  async waitForCustomEvent(): Promise<Request> {
    return this.page.waitForRequest((request) => {
      return isUaCustomEvent(request);
    });
  }
}
