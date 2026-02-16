import {test as base} from '@playwright/test';
import {InsightQuerySummaryPageObject} from './page-object';

type AtomicInsightQuerySummaryE2EFixtures = {
  querySummary: InsightQuerySummaryPageObject;
};

export const test = base.extend<AtomicInsightQuerySummaryE2EFixtures>({
  querySummary: async ({page}, use) => {
    await use(new InsightQuerySummaryPageObject(page));
  },
});

export {expect} from '@playwright/test';
