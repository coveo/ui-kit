import {BasePageObject} from '@/playwright-utils/base-page-object';
import {Page} from '@playwright/test';

export class ProductMultiValueTextPageObject extends BasePageObject<'atomic-product-multi-value-text'> {
  constructor(page: Page) {
    super(page, 'atomic-product-multi-value-text');
  }

  get values() {
    return this.hydrated
      .first()
      .locator('li[part="product-multi-value-text-value"]');
  }

  get separators() {
    return this.hydrated.first().locator('li[class="separator"]');
  }

  moreValuesIndicator(expectedNumber?: number) {
    return this.hydrated
      .first()
      .getByText(
        `${expectedNumber ? expectedNumber.toString() + ' ' : ''}more...`
      );
  }

  async withCustomDelimiter({
    delimiter,
    values,
    field,
  }: {
    delimiter: string;
    values: string[];
    field: string;
  }) {
    await this.page.route('**/commerce/v2/listing', async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      body.products[0][field] = values.join(delimiter);
      await route.fulfill({
        response,
        json: body,
      });
    });

    return this;
  }
}
