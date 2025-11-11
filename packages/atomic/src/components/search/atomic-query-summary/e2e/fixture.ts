import {test as base} from '@playwright/test';
import {AtomicQuerySummaryPageObject} from './page-object';

type Fixtures = {
  querySummary: AtomicQuerySummaryPageObject;
};

export const test = base.extend<Fixtures>({
  querySummary: async ({page}, use) => {
    await use(new AtomicQuerySummaryPageObject(page));
  },
});

export {expect} from '@playwright/test';
