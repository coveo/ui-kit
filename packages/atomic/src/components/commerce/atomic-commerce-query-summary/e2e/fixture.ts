import {
  AxeFixture,
  makeAxeBuilder,
} from '@coveo/atomic/playwrightUtils/base-fixture';
import {test as base} from '@playwright/test';
import {AtomicCommerceSearchBoxLocators as SearchBox} from '../../atomic-commerce-search-box/e2e/page-object';
import {AtomicCommerceQuerySummaryLocators as QuerySummary} from './page-object';

type MyFixtures = {
  searchBox: SearchBox;
  querySummary: QuerySummary;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  searchBox: async ({page}, use) => {
    await use(new SearchBox(page));
  },
  querySummary: async ({page}, use) => {
    await use(new QuerySummary(page));
  },
});
export {expect} from '@playwright/test';
