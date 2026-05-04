import {test as base} from '@playwright/test';
import {AtomicInsightResultActionPageObject} from './page-object';

type InsightResultActionFixtures = {
  insightResultAction: AtomicInsightResultActionPageObject;
};

export const test = base.extend<InsightResultActionFixtures>({
  insightResultAction: async ({page}, use) => {
    await use(new AtomicInsightResultActionPageObject(page));
  },
});

export {expect} from '@playwright/test';
