import type {Page} from '@playwright/test';

export class HydratedPageObject {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get hydratedMessage() {
    return this.page.getByText(/Rendered page with \d* products/);
  }
  get hydratedCartMessage() {
    return this.page.getByText(/Items in cart: \d*/);
  }

  get hydratedIndicator() {
    return this.page.locator('#hydrated-indicator').isChecked();
  }

  get hydratedTimestamp() {
    return this.page.locator('#timestamp');
  }
}
