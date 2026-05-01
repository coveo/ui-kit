import {test as base} from '@playwright/test';
import {AtomicInsightResultAttachToCaseActionPageObject} from './page-object';

type InsightResultAttachToCaseActionFixtures = {
  insightResultAttachToCaseAction: AtomicInsightResultAttachToCaseActionPageObject;
};

export const test = base.extend<InsightResultAttachToCaseActionFixtures>({
  insightResultAttachToCaseAction: async ({page}, use) => {
    await use(new AtomicInsightResultAttachToCaseActionPageObject(page));
  },
});

export {expect} from '@playwright/test';
