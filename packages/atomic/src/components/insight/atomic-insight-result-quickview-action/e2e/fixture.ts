import {test as base} from '@playwright/test';
import {AtomicInsightResultQuickviewActionLocators as InsightResultQuickviewAction} from './page-object';

type MyFixtures = {
  insightResultQuickviewAction: InsightResultQuickviewAction;
};

export const test = base.extend<MyFixtures>({
  insightResultQuickviewAction: async ({page}, use) => {
    await use(new InsightResultQuickviewAction(page));
  },
});
export {expect} from '@playwright/test';
