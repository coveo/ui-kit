import {Page, Locator} from '@playwright/test';

export class ConfigurationObject {
  constructor(private page: Page) {
    this.page = page;
  }

  get tryButton(): Locator {
    return this.page.getByTestId('cfg-try');
  }

  get resetButton(): Locator {
    return this.page.getByTestId('cfg-reset');
  }

  get configurationForm(): Locator {
    return this.page.locator('slot[name="configuration"]');
  }

  private getInputSelector(field: string): Locator {
    return this.page.getByTestId(`cfg-${field}`).locator('input');
  }

  async waitForConfigurationToLoad(): Promise<void> {
    await this.configurationForm.waitFor({state: 'visible'});
  }

  async configure(
    options: Record<string, string | number | boolean> = {}
  ): Promise<void> {
    await this.waitForConfigurationToLoad();

    for (const key of Object.keys(options)) {
      await this.getInputSelector(key).fill(options[key].toString(), {
        timeout: 5000,
      });
    }

    await this.tryButton.click();
  }

  async reset(): Promise<void> {
    await this.resetButton.click();
  }
}
