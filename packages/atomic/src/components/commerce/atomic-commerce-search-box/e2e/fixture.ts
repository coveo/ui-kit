import {test as base} from '@playwright/test';
import {FacetsPageObject} from '../../atomic-commerce-facets/e2e/page-object';
import {LoadMoreProductsPageObject} from '../../atomic-commerce-load-more-products/e2e/page-object';
import {SearchBoxPageObject} from './page-object';

type MyFixtures = {
  searchBox: SearchBoxPageObject;
  facets: FacetsPageObject;
  loadMore: LoadMoreProductsPageObject;
};

export const test = base.extend<MyFixtures>({
  searchBox: async ({page}, use) => {
    await use(new SearchBoxPageObject(page));
  },
  facets: async ({page}, use) => {
    await use(new FacetsPageObject(page));
  },
  loadMore: async ({page}, use) => {
    await use(new LoadMoreProductsPageObject(page));
  },
});

export {expect} from '@playwright/test';
