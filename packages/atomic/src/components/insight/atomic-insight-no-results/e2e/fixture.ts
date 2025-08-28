import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicInsightNoResultsPageObject} from './page-object';

type Fixtures = {
  insightNoResults: AtomicInsightNoResultsPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  insightNoResults: async ({page}, use) => {
    await use(new AtomicInsightNoResultsPageObject(page));
  },
});

export {expect} from '@playwright/test';
