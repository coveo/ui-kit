import {test as base} from '@playwright/test';
import {SearchBoxPageObject as SearchBox} from '../../atomic-commerce-search-box/e2e/page-object';
import {QueryErrorPageObject as QueryError} from './page-object';

type MyFixtures = {
  searchBox: SearchBox;
  queryError: QueryError;
};

export const test = base.extend<MyFixtures>({
  searchBox: async ({page}, use) => {
    await use(new SearchBox(page));
  },
  queryError: async ({page}, use) => {
    await use(new QueryError(page));
  },
});
export {expect} from '@playwright/test';
