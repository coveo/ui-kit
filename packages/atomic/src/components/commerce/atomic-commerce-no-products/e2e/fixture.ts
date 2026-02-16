import {test as base} from '@playwright/test';
import {SearchBoxPageObject as SearchBox} from '../../atomic-commerce-search-box/e2e/page-object';
import {NoProductsPageObject as NoProducts} from './page-object';

type MyFixtures = {
  searchBox: SearchBox;
  noProducts: NoProducts;
};

export const test = base.extend<MyFixtures>({
  searchBox: async ({page}, use) => {
    await use(new SearchBox(page));
  },
  noProducts: async ({page}, use) => {
    await use(new NoProducts(page));
  },
});
export {expect} from '@playwright/test';
