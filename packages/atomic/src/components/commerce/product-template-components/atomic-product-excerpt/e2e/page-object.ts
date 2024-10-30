import {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwright-utils/base-page-object';

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
}
