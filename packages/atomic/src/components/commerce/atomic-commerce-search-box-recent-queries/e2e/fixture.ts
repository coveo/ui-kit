import {test as base} from '@playwright/test';
import {AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicCommerceSearchBoxRecentQueriesPageObject} from './page-object';

type Fixtures = {
  commerceSearchBoxRecentQueries: AtomicCommerceSearchBoxRecentQueriesPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  commerceSearchBoxRecentQueries: async ({page}, use) => {
    await use(new AtomicCommerceSearchBoxRecentQueriesPageObject(page));
  },
});

export {expect} from '@playwright/test';
