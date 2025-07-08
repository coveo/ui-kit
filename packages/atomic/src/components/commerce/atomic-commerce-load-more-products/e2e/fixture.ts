import {AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {test as base} from '@playwright/test';
import {ProductsPageObject as Products} from '../../atomic-product/e2e/page-object';
import {LoadMoreProductsPageObject as LoadMore} from './page-object';

type MyFixtures = {
  loadMore: LoadMore;
  products: Products;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  loadMore: async ({page}, use) => {
    await use(new LoadMore(page));
  },
  products: async ({page}, use) => {
    await use(new Products(page));
  },
});
export {expect} from '@playwright/test';
