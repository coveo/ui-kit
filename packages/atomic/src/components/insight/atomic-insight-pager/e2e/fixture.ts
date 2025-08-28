import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicInsightPagerPageObject} from './page-object';

type Fixtures = {
  insightPager: AtomicInsightPagerPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  insightPager: async ({page}, use) => {
    await use(new AtomicInsightPagerPageObject(page));
  },
});

export {expect} from '@playwright/test';
