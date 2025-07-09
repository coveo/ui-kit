import {test as base} from '@playwright/test';
import {AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {ProductPricePageObject as ProductPrice} from './page-object';

type MyFixtures = {
  productPrice: ProductPrice;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  productPrice: async ({page}, use) => {
    await use(new ProductPrice(page));
  },
});

export {expect} from '@playwright/test';
