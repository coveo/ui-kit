import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicInsightTabPageObject} from './page-object';

type Fixtures = {
  insightTab: AtomicInsightTabPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  insightTab: async ({page}, use) => {
    await use(new AtomicInsightTabPageObject(page));
  },
});

export {expect} from '@playwright/test';
