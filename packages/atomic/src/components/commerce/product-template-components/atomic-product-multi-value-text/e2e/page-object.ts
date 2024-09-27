import {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwright-utils/base-page-object';

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
}
