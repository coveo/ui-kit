import {test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../playwright-utils/base-fixture';
import {SearchBoxPageObject as SearchBox} from '../../atomic-commerce-search-box/e2e/page-object';
import {ProductsPageObject as Products} from '../../atomic-product/e2e/page-object';
import {LoadMoreProductsPageObject as LoadMore} from './page-object';

type MyFixtures = {
  searchBox: SearchBox;
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
