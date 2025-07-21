import type {Locator, Page} from '@playwright/test';

export class StandaloneSearchBoxObject {
  constructor(public page: Page) {
    this.page = page;
  }
  get component(): Locator {
    return this.page.locator('c-quantic-standalone-search-box');
  }

  get searchBoxInput(): Locator {
    return this.component.getByTestId('quantic-search-box-input');
  }

  get searchButton(): Locator {
    return this.searchBoxInput.getByTestId('search-box-submit-button');
  }

  get searchIcon(): Locator {
    return this.component.locator(
      'c-quantic-search-box-input [data-testid="search-box-search-icon"]'
    );
  }

  get clearButton(): Locator {
    return this.component.locator(
      'c-quantic-search-box-input [data-testid="search-box-clear-button"]'
    );
  }

  get suggestionsList(): Locator {
    return this.component.getByTestId('suggestion-list');
  }

  get suggestions(): Locator {
    return this.component.getByTestId('suggestions-option');
  }

  getSearchInputElement(isTextarea: boolean): Locator {
    return isTextarea
      ? this.searchBoxInput.getByTestId('search-box-textarea')
      : this.searchBoxInput.getByTestId('search-box-input');
  }

  async getLocalStorageData() {
    await this.page.getByTestId('localstorage-input').locator('input').fill('');
    await this.page.getByTestId('localstorage-get-button').click();
    const content = await this.page
      .getByTestId('localstorage-output')
      .textContent();

    return content ? JSON.parse(content) : null;
  }
}
