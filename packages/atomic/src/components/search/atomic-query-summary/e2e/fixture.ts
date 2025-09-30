import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicQuerySummaryPageObject} from './page-object';

type Fixtures = {
  querySummary: AtomicQuerySummaryPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  querySummary: async ({page}, use) => {
    await use(new AtomicQuerySummaryPageObject(page));
  },
});

export {expect} from '@playwright/test';
