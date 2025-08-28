import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicInsightQuerySummaryPageObject} from './page-object';

type Fixtures = {
  insightQuerySummary: AtomicInsightQuerySummaryPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  insightQuerySummary: async ({page}, use) => {
    await use(new AtomicInsightQuerySummaryPageObject(page));
  },
});

export {expect} from '@playwright/test';
