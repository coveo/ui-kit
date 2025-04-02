import {Locator, Page, expect} from '@playwright/test';

export class InsightSetupObject {
  constructor(private page: Page) {
    this.page = page;
  }

  get initializationInput(): Locator {
    return this.page.locator(
      'c-quantic-insight-interface input[type="hidden"]'
    );
  }

  async waitForInsightInterfaceInitialization(): Promise<void> {
    await this.initializationInput.waitFor({state: 'attached'});
    await expect(this.initializationInput).toHaveAttribute(
      'is-initialized',
      'true'
    );
  }
}
