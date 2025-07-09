import {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class ProductPricePageObject extends BasePageObject<'atomic-product-price'> {
  constructor(page: Page) {
    super(page, 'atomic-product-price');
  }

  get blueLagoonPrice() {
    return this.page.getByText('$1,000.00');
  }

  get AquaMarinaPrice() {
    return this.page.getByText('$39.00');
  }

  get AquaMarinaPromoPrice() {
    return this.page.getByText('$36.00');
  }

  async withCustomPrices({
    price,
    promoPrice,
  }: {
    price: number;
    promoPrice: number;
  }) {
    await this.page.route('**/commerce/v2/listing', async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      body.products[0].ec_price = price;
      body.products[0].ec_promo_price = promoPrice;
      await route.fulfill({
        response,
        json: body,
      });
    });

    return this;
  }
}
