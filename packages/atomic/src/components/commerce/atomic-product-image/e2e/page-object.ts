import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class ProductImageObject extends BasePageObject<'atomic-product-image'> {
  constructor(page: Page) {
    super(page, 'atomic-product-image');
  }

  get noCarouselImage() {
    return this.page.getByRole('img').nth(0);
  }

  get carouselImage() {
    return this.page.getByRole('img').nth(1);
  }

  get nextButton() {
    return this.page.getByRole('button', {name: 'Next'});
  }

  get previousButton() {
    return this.page.getByRole('button', {name: 'Previous'});
  }

  get indicatorDot() {
    return this.page.getByRole('listitem').nth(1);
  }
}
