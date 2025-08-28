import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicInsightResultPageObject} from './page-object';

type Fixtures = {
  insightResult: AtomicInsightResultPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  insightResult: async ({page}, use) => {
    await use(new AtomicInsightResultPageObject(page));
  },
});

export {expect} from '@playwright/test';
