import {test as base} from '@playwright/test';
import {InsightSearchBoxPageObject} from './page-object';

type AtomicInsightSearchBoxE2EFixtures = {
  searchBox: InsightSearchBoxPageObject;
};

export const test = base.extend<AtomicInsightSearchBoxE2EFixtures>({
  searchBox: async ({page}, use) => {
    await use(new InsightSearchBoxPageObject(page));
  },
});

export {expect} from '@playwright/test';
