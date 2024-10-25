import {Page, expect} from '@playwright/test';

export class InsightObject {
  constructor(private page: Page) {}

  get initializationInput() {
    return this.page.locator(
      'c-quantic-insight-interface input[type="hidden"]'
    );
  }

  async waitForInsightInterfaceInitialization() {
    await this.initializationInput.waitFor({state: 'attached'});
    await expect(this.initializationInput).toHaveAttribute(
      'is-initialized',
      'true'
    );
  }
}
