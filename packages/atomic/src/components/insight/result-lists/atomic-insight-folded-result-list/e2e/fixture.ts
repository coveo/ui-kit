import {test as base} from '@playwright/test';
import {AtomicInsightFoldedResultListPageObject as InsightFoldedResultList} from './page-object';

type Fixture = {
  insightFoldedResultList: InsightFoldedResultList;
};

export const test = base.extend<Fixture>({
  insightFoldedResultList: async ({page}, use) => {
    await use(new InsightFoldedResultList(page));
  },
});

export {expect} from '@playwright/test';
