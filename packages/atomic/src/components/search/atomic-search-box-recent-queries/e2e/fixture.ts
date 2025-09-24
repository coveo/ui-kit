import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicSearchBoxRecentQueriesPageObject} from './page-object.js';

type Fixtures = {
  searchBoxRecentQueries: AtomicSearchBoxRecentQueriesPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  searchBoxRecentQueries: async ({page}, use) => {
    await use(new AtomicSearchBoxRecentQueriesPageObject(page));
  },
});

export {expect} from '@playwright/test';
