import {test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../playwright-utils/base-fixture';
import {SearchBoxPageObject as SearchBox} from '../../atomic-commerce-search-box/e2e/page-object';
import {QuerySummaryPageObject as QuerySummary} from './page-object';

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
