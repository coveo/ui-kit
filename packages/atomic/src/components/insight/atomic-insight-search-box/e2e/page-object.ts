import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class InsightSearchBoxPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-search-box');
  }

  get component() {
    return this.page.locator('atomic-insight-search-box');
  }

  get searchInput() {
    return this.component.getByRole('textbox');
  }

  get submitIcon() {
    return this.component.locator('[part="submit-icon"]');
  }

  get clearButton() {
    return this.component.getByRole('button', {name: /clear/i});
  }

  get suggestionsWrapper() {
    return this.component.locator('[part="suggestions-wrapper"]');
  }

  searchSuggestions({index, total}: {index?: number; total?: number} = {}) {
    return this.page.getByLabel(
      new RegExp(
        `suggested query\\.(?: Button\\.)? ${index ?? '\\d+'} of ${total ?? '\\d+'}\\.`
      )
    );
  }

  async typeInSearchBox(text: string) {
    await this.searchInput.fill(text);
  }

  async clearSearchBox() {
    await this.clearButton.click();
  }

  async submitSearch() {
    await this.searchInput.press('Enter');
  }
}
