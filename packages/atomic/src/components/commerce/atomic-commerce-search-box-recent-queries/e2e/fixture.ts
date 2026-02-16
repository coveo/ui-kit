import {test as base} from '@playwright/test';
import {AtomicCommerceSearchBoxRecentQueriesPageObject} from './page-object';

type Fixtures = {
  commerceSearchBoxRecentQueries: AtomicCommerceSearchBoxRecentQueriesPageObject;
};

export const test = base.extend<Fixtures>({
  commerceSearchBoxRecentQueries: async ({page}, use) => {
    await use(new AtomicCommerceSearchBoxRecentQueriesPageObject(page));
  },
});

export {expect} from '@playwright/test';
