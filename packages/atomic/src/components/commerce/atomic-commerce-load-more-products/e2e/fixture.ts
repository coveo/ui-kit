import {
  AxeFixture,
  makeAxeBuilder,
} from '@coveo/atomic/playwrightUtils/base-fixture';
import {test as base} from '@playwright/test';
import {AtomicCommerceSearchBoxLocators as SearchBox} from '../../atomic-commerce-search-box/e2e/page-object';
import {AtomicCommerceProductsLocators as Products} from '../../atomic-product/e2e/page-object';
import {AtomicCommerceLoadMoreProductsLocators as LoadMore} from './page-object';

type MyFixtures = {
  searchBox: SearchBox; //
  loadMore: LoadMore;
  products: Products;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  loadMore: async ({page}, use) => {
    await use(new LoadMore(page));
  },
  searchBox: async ({page}, use) => {
    await use(new SearchBox(page));
  },
  products: async ({page}, use) => {
    await use(new Products(page));
  },
});
export {expect} from '@playwright/test';
