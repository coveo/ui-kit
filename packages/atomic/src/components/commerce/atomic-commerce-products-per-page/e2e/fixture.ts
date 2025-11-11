import {test as base} from '@playwright/test';
import {ProductsPerPageObject} from './page-object';

type MyFixtures = {
  productsPerPage: ProductsPerPageObject;
};

export const test = base.extend<MyFixtures>({
  productsPerPage: async ({page}, use) => {
    await use(new ProductsPerPageObject(page));
  },
});
export {expect} from '@playwright/test';
