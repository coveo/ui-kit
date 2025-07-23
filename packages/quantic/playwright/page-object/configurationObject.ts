import {Page, Locator} from '@playwright/test';

export class ConfigurationObject {
  constructor(private page: Page) {
    this.page = page;
  }

  get tryButton(): Locator {
    return this.page.locator('lightning-button[data-testid="cfg-try"]');
  }

  get resetButton(): Locator {
    return this.page.locator('lightning-button[data-testid="cfg-reset"]');
  }

  get configurationForm(): Locator {
    return this.page.locator('slot[name="configuration"]');
  }

  private getInputSelector(field: string): string {
    return `lightning-input[data-testid="cfg-${field}"] input`;
  }

  async waitForConfigurationToLoad(): Promise<void> {
    await this.configurationForm.waitFor({state: 'visible'});
  }

  async configure(
    options: Record<string, string | number | boolean> = {}
  ): Promise<void> {
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

  async reset(): Promise<void> {
    await this.resetButton.click();
  }
}
