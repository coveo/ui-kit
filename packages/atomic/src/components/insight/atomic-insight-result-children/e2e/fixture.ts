import {test as base} from '@playwright/test';
import {AtomicInsightResultChildrenPageObject} from './page-object';

type InsightResultChildrenFixtures = {
  insightResultChildren: AtomicInsightResultChildrenPageObject;
};

export const test = base.extend<InsightResultChildrenFixtures>({
  insightResultChildren: async ({page}, use) => {
    await use(new AtomicInsightResultChildrenPageObject(page));
  },
});

export {expect} from '@playwright/test';
