import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicInsightLayoutPageObject} from './page-object';

type Fixtures = {
  insightLayout: AtomicInsightLayoutPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  insightLayout: async ({page}, use) => {
    await use(new AtomicInsightLayoutPageObject(page));
  },
});

export {expect} from '@playwright/test';
