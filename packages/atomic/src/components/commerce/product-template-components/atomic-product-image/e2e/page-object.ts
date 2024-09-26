import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwright-utils/base-page-object';

export class ProductImageObject extends BasePageObject<'atomic-product-image'> {
  constructor(page: Page) {
    super(page, 'atomic-product-image');
  }

  async withMoreImages() {
    await this.page.route('**/commerce/v2/listing', async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      body.products[0].ec_thumbnails = [
        'https://images.barca.group/Sports/mj/Sandals%20%26%20Shoes/Sandals/47_Blue_Women_Logo_Flip_Flop/7940686db76f_bottom_left.webp',
        'https://images.barca.group/Sports/mj/Clothing/T-Shirts/29_Women_Blue_Cotton/2b1a880a2e30_bottom_left.webp',
        'https://images.barca.group/Sports/mj/Clothing/T-Shirts/29_Women_Blue_Elastane/892ee4fe4145_bottom_left.webp',
      ];

      await route.fulfill({
        response,
        json: body,
      });
    });
    return this;
  }

  async withNoImage() {
    await this.page.route('**/commerce/v2/listing', async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      body.products[0].ec_thumbnails = [];

      await route.fulfill({
        response,
        json: body,
      });
    });
    return this;
  }
}
