import {test as base} from '@playwright/test';
import {AtomicInsightFoldedResultListPageObject} from './page-object';

type InsightFoldedResultListFixtures = {
  insightFoldedResultList: AtomicInsightFoldedResultListPageObject;
};

export const test = base.extend<InsightFoldedResultListFixtures>({
  insightFoldedResultList: async ({page}, use) => {
    await use(new AtomicInsightFoldedResultListPageObject(page));
  },
});

export {expect} from '@playwright/test';
