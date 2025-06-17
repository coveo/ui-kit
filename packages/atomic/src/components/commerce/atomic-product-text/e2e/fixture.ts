import {makeAxeBuilder, AxeFixture} from '@/playwright-utils/base-fixture';
import {test as base} from '@playwright/test';
import {ProductsPageObject as Product} from '../../../atomic-product/e2e/page-object';
import {ProductTextPageObject as ProductText} from './page-object';

type MyFixtures = {
  productText: ProductText;
  product: Product;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  productText: async ({page}, use) => {
    await use(new ProductText(page));
  },
  product: async ({page}, use) => {
    await use(new Product(page));
  },
});

export {expect} from '@playwright/test';
