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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async withCustomThumbnails(thumbnails: any[]) {
    await this.page.route('**/commerce/v2/listing', async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      body.products[0].ec_thumbnails = thumbnails;

      await route.fulfill({
        response,
        json: body,
      });
    });
    return this;
  }

  async withCustomField(
    fieldNoCarousel: string | string[],
    fieldCarousel: string | string[]
  ) {
    await this.page.route('**/commerce/v2/listing', async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      body.products[0].custom_alt_field = fieldNoCarousel;
      body.products[1].custom_alt_field = fieldCarousel;

      await route.fulfill({
        response,
        json: body,
      });
    });
    return this;
  }
}
