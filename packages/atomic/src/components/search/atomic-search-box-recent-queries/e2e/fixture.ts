import {test as base} from '@playwright/test';
import {AtomicSearchBoxRecentQueriesPageObject} from './page-object.js';

type Fixtures = {
  searchBoxRecentQueries: AtomicSearchBoxRecentQueriesPageObject;
};

export const test = base.extend<Fixtures>({
  searchBoxRecentQueries: async ({page}, use) => {
    await use(new AtomicSearchBoxRecentQueriesPageObject(page));
  },
});
