import {test as base} from '@playwright/test';
import {InsightPagerPageObject} from './page-object';

type InsightPagerFixtures = {
  pager: InsightPagerPageObject;
};

export const test = base.extend<InsightPagerFixtures>({
  pager: async ({page}, use) => {
    await use(new InsightPagerPageObject(page));
  },
});

export {expect} from '@playwright/test';
