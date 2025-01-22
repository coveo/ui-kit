import type {Locator, Page} from '@playwright/test';

export class SmartSnippetSuggestionsObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get smartSnippetSuggestions(): Locator {
    return this.page.locator('c-quantic-smart-snippet-suggestions');
  }
}
