import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class ProductExcerptPageObject extends BasePageObject<'atomic-product-excerpt'> {
  constructor(page: Page) {
    super(page, 'atomic-product-excerpt');
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

  async withLongExcerpt() {
    await this.page.route('**/commerce/v2/search', async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      body.products[0].excerpt =
        'This is a long excerpt that should be truncated'.repeat(10);
      await route.fulfill({
        response,
        json: body,
      });
    });

    return this;
  }
}
