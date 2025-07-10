import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class ProductDescriptionPageObject extends BasePageObject<'atomic-product-description'> {
  constructor(page: Page) {
    super(page, 'atomic-product-description');
  }

  get textContent() {
    return this.page.locator('.expandable-text');
  }

  get highlightedText() {
    return this.page.locator('atomic-product-text b');
  }

  get showMoreButton() {
    return this.page.getByRole('button', {name: 'Show more'});
  }

  get showLessButton() {
    return this.page.getByRole('button', {name: 'Show less'});
  }

  async withLongDescription() {
    await this.page.route('**/commerce/v2/search', async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      body.products[0].ec_description =
        'This is a long description that should be truncated'.repeat(10);
      await route.fulfill({
        response,
        json: body,
      });
    });

    return this;
  }
}
