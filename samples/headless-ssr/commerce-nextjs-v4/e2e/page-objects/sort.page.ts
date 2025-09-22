import type {Page} from '@playwright/test';

export class SortPageObject {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
  get sortSelect() {
    return this.page.locator('#sorts-select');
  }
  get selectedOption() {
    return this.sortSelect.getByRole('option', {selected: true});
  }
}
