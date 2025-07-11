import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class LoadMoreResultsPageObject extends BasePageObject<'atomic-load-more-results'> {
  constructor(page: Page) {
    super(page, 'atomic-load-more-results');
  }

  get hydrated() {
    return this.page.locator('atomic-load-more-results[class*="hydrated"]');
  }

  get button() {
    return this.page.getByRole('button', {name: 'Load more results'});
  }

  get summary() {
    return this.page.getByText(/Showing .+ of .+ results/);
  }

  async getScrollPosition(): Promise<number> {
    return await this.page.evaluate(() => window.scrollY);
  }

  async scrollToElement(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }
}
