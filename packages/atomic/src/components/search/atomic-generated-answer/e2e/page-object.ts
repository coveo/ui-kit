import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';
import type {SearchBoxPageObject} from '../../atomic-search-box/e2e/page-object';

export class GeneratedAnswerPageObject extends BasePageObject<'atomic-generated-answer'> {
  constructor(page: Page) {
    super(page, 'atomic-generated-answer');
  }

  get citation() {
    return this.page.locator('atomic-citation [part="citation"]');
  }

  async waitForCitations() {
    await this.citation.first().waitFor({state: 'visible', timeout: 40000});
  }

  async getCitationCount(): Promise<number> {
    return await this.citation.count();
  }

  async getCitationHref(index: number = 0): Promise<string | null> {
    return await this.citation.nth(index).getAttribute('href');
  }

  async performSearch(searchBox: SearchBoxPageObject) {
    await searchBox.searchInput.fill(
      'how to resolve netflix connection with tivo'
    );
    await searchBox.submitButton.click();
  }
}
