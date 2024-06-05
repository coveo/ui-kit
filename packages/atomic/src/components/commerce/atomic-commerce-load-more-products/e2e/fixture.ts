import {
  AxeFixture,
  makeAxeBuilder,
} from '@coveo/atomic/playwrightUtils/base-fixture';
import {test as base} from '@playwright/test';
import {AtomicCommerceSearchBoxLocators as SearchBox} from '../../atomic-commerce-search-box/e2e/page-object';
import {AtomicCommerceLoadMoreProductsLocators as LoadMore} from './page-object';

type MyFixtures = {
  searchBox: SearchBox; // TODO: remove this?
  loadMore: LoadMore;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  searchBox: async ({page}, use) => {
    await use(new SearchBox(page));
  },
  loadMore: async ({page}, use) => {
    await use(new LoadMore(page));
  },
});
export {expect} from '@playwright/test';
