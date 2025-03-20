import type {Locator, Page} from '@playwright/test';

export class ResultQuickviewObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get button(): Locator {
    return this.page.locator('c-quantic-result-quickview button');
  }

  get buttonIcon(): Locator {
    return this.button.locator('lightning-icon');
  }

  get buttonTooltip(): Locator {
    return this.button
      .locator('..')
      .locator('c-quantic-tooltip div[slot="content"]');
  }

  get modalTitle(): Locator {
    return this.page.locator(
      'c-quantic-result-quickview header c-quantic-result-highlighted-text-field span'
    );
  }

  get modalContent(): Locator {
    return this.page.locator('c-quantic-quickview-content');
  }

  async clickQuickviewButton(): Promise<void> {
    await this.button.click();
  }

  async receivedEvents(): Promise<Array<string>> {
    return this.page.locator('.event__received').allTextContents();
  }
}
