import {Page} from '@playwright/test';

export class ConfigurationObject {
  constructor(private page: Page) {}

  get tryButton() {
    return this.page.locator('lightning-button[data-cy="cfg-try"]');
  }

  get resetButton() {
    return this.page.locator('lightning-button[data-cy="cfg-reset"]');
  }

  get configurationForm() {
    return this.page.locator('slot[name="configuration"]');
  }

  private getInputSelector(field: string): string {
    return `lightning-input[data-cy="cfg-${field}"] input`;
  }

  async waitForConfigurationToLoad() {
    await this.configurationForm.waitFor({state: 'visible'});
  }

  async configure(options: Record<string, string | number | boolean> = {}) {
    await this.waitForConfigurationToLoad();

    for (const key of Object.keys(options)) {
      await this.page.fill(
        this.getInputSelector(key),
        options[key].toString(),
        {timeout: 5000}
      );
    }

    await this.tryButton.click();
  }

  async reset() {
    await this.resetButton.click();
  }
}
