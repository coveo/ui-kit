import {makeAxeBuilder, AxeFixture} from '@/playwright-utils/base-fixture';
import {test as base} from '@playwright/test';
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
