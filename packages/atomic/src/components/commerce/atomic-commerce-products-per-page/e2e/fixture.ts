import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {ProductsPerPageObject} from './page-object';

type MyFixtures = {
  productsPerPage: ProductsPerPageObject;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  productsPerPage: async ({page}, use) => {
    await use(new ProductsPerPageObject(page));
  },
});
export {expect} from '@playwright/test';
