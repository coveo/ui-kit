import type {Locator, Page} from '@playwright/test';

export class ExampleInsightPanelObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get exampleInsightPanel(): Locator {
    return this.page.locator('c-example-insight-panel');
  }

  get searchbox(): Locator {
    return this.exampleInsightPanel.locator('c-quantic-searchbox');
  }

  get refineToggle(): Locator {
    return this.exampleInsightPanel.locator('c-quantic-refine-toggle');
  }

  get tabBar(): Locator {
    return this.exampleInsightPanel.locator('c-quantic-tab-bar');
  }
}
